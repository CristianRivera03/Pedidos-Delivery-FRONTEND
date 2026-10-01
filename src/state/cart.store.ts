import { createMemo, createRoot, createSignal } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { Product } from '@core/entities/product.entity';
import { CartItem, CartTotals, IVA_RATE, round2 } from '@core/entities/cart.entity';
import { CheckoutDTO, Order, PaymentMethod } from '@core/entities/order.entity';
import { ApiError } from '@core/errors/ApiError';
import { orderService, productService } from '@infrastructure/services';
import { authStore } from '@state/auth.store';

// RF-04: Carrito reactivo en el cliente (persistido en localStorage)
// RF-05: Checkout -> POST /orders

const CART_KEY = 'delivery_cart';

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

// createRoot evita el warning de "computations created outside a root" en los memos globales
const cartStore = createRoot(() => {
  const [items, setItems] = createStore<CartItem[]>(loadCart());
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [checkoutError, setCheckoutError] = createSignal<string | null>(null);
  const [lastOrder, setLastOrder] = createSignal<Order | null>(null);

  const persist = () => saveCart(items.map((i) => ({ ...i })));

  // ---------- Cálculos reactivos (se recalculan solos al cambiar el carrito) ----------
  const lineSubtotal = (item: CartItem): number => round2(item.unitPrice * item.quantity);
  const lineSubtotalWithIva = (item: CartItem): number => round2(lineSubtotal(item) * (1 + IVA_RATE));

  const totals = createMemo<CartTotals>(() => {
    const itemsCount = items.reduce((acc, i) => acc + i.quantity, 0);
    // Mismo cálculo que Order.create() del backend
    const subtotal = round2(items.reduce((acc, i) => acc + lineSubtotal(i), 0));
    const taxAmount = round2(subtotal * IVA_RATE);
    const total = round2(subtotal + taxAmount);
    return { itemsCount, subtotal, taxAmount, total };
  });

  const isEmpty = createMemo(() => items.length === 0);

  // ---------- Acciones ----------
  const getQuantity = (productId: string): number =>
    items.find((i) => i.productId === productId)?.quantity ?? 0;

  /** Agrega 1 unidad (o `qty`). Devuelve false si se supera el stock. */
  const addItem = (product: Product, qty = 1): boolean => {
    const current = getQuantity(product.id);
    if (product.stock <= 0 || current + qty > product.stock) return false;

    if (current > 0) {
      setItems(
        (i) => i.productId === product.id,
        produce((i) => {
          i.quantity += qty;
          i.stock = product.stock;
          i.unitPrice = Number(product.price);
        }),
      );
    } else {
      setItems(items.length, {
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl ?? null,
        unitPrice: Number(product.price),
        quantity: qty,
        stock: product.stock,
      });
    }
    persist();
    return true;
  };

  /** Cambia la cantidad; si llega a 0 se elimina la línea. */
  const updateQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(
      (i) => i.productId === productId,
      produce((i) => {
        i.quantity = Math.min(Math.floor(quantity), i.stock);
      }),
    );
    persist();
  };

  const increment = (productId: string) => updateQuantity(productId, getQuantity(productId) + 1);
  const decrement = (productId: string) => updateQuantity(productId, getQuantity(productId) - 1);

  const removeItem = (productId: string): void => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    persist();
  };

  const clear = (): void => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  };

  /**
   * Vuelve a consultar el stock real de cada producto del carrito y ajusta las cantidades.
   * Se usa cuando el backend responde 409 (otro cliente compró primero).
   */
  const refreshStock = async (): Promise<void> => {
    const current = items.map((i) => ({ ...i }));
    for (const item of current) {
      try {
        const product = await productService.getProductById(item.productId);
        if (!product.isActive || product.stock <= 0) {
          removeItem(item.productId);
          continue;
        }
        setItems(
          (i) => i.productId === item.productId,
          produce((i) => {
            i.stock = product.stock;
            i.unitPrice = Number(product.price);
            i.quantity = Math.min(i.quantity, product.stock);
          }),
        );
      } catch {
        removeItem(item.productId); // El producto ya no existe
      }
    }
    persist();
  };

  /** RNF-08 (cliente): mensaje según el tipo de error del Envelope Pattern */
  const handleCheckoutError = async (err: unknown): Promise<string> => {
    if (!(err instanceof ApiError)) {
      return err instanceof Error ? err.message : 'No se pudo procesar el pedido';
    }
    switch (err.statusCode) {
      case 409: // Stock insuficiente / concurrencia
        await refreshStock();
        return `${err.message}. Actualizamos tu carrito con el stock disponible; revisa las cantidades.`;
      case 404:
        await refreshStock();
        return 'Uno de los productos ya no está disponible. Lo quitamos de tu carrito.';
      case 400:
        return `Datos inválidos: ${err.message}`;
      case 401:
        authStore.logout();
        return 'Tu sesión expiró. Inicia sesión nuevamente.';
      case 403:
        return 'Tu rol no tiene permiso para realizar pedidos (solo CLIENTE).';
      case 0:
        return err.message;
      default: // 500 infraestructura
        return 'Error del servidor: el pedido no se procesó y no se descontó inventario. Intenta de nuevo.';
    }
  };

  // ---------- RF-05: Checkout ----------
  const checkout = async (deliveryAddress: string, paymentMethod: PaymentMethod): Promise<Order | null> => {
    const token = authStore.token();
    if (!token) {
      setCheckoutError('Debes iniciar sesión para confirmar el pedido.');
      return null;
    }
    if (items.length === 0) {
      setCheckoutError('El carrito está vacío.');
      return null;
    }

    const dto: CheckoutDTO = {
      paymentMethod,
      deliveryAddress: deliveryAddress.trim(),
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    setIsSubmitting(true);
    setCheckoutError(null);
    try {
      const order = await orderService.checkout(dto, token);
      setLastOrder(order);
      clear(); // Solo se vacía si el backend confirmó (201)
      return order;
    } catch (err: unknown) {
      setCheckoutError(await handleCheckoutError(err));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // estado
    items,
    totals,
    isEmpty,
    isSubmitting,
    checkoutError,
    lastOrder,
    // helpers
    lineSubtotal,
    lineSubtotalWithIva,
    getQuantity,
    // acciones
    addItem,
    updateQuantity,
    increment,
    decrement,
    removeItem,
    clear,
    checkout,
    refreshStock,
    clearCheckoutError: () => setCheckoutError(null),
    clearLastOrder: () => setLastOrder(null),
  };
});

export { cartStore };