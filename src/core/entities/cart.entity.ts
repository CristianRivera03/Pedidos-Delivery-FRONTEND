// RF-04: Entidades del Carrito de Compras (vive solo en el cliente web)

// IVA de El Salvador (13%) con IVA_RATE del backend (order.entity.ts)
export const IVA_RATE = 0.13;

export interface CartItem {
  productId: string;
  name: string;
  imageUrl?: string | null;
  unitPrice: number; // Precio SIN IVA (tal como viene de la API)
  quantity: number;
  stock: number; // Stock disponible al momento de agregarlo (para no pasarse)
}

export interface CartTotals {
  itemsCount: number; // Total de unidades
  subtotal: number; // Suma sin IVA
  taxAmount: number; // IVA 13%
  total: number; // Subtotal + IVA
}

// 2 decimales (mismo criterio que el backend)
export const round2 = (value: number): number => Math.round(value * 100) / 100;

// Precio unitario con IVA incluido
export const priceWithIva = (priceWithoutIva: number): number => round2(Number(priceWithoutIva) * (1 + IVA_RATE));

// Solo el monto del IVA de un precio
export const ivaOf = (priceWithoutIva: number): number => round2(Number(priceWithoutIva) * IVA_RATE);

// Formato de moneda
export const formatMoney = (value: number): string => `$${Number(value).toFixed(2)}`;