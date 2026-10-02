import { Component, For, Show, createSignal } from 'solid-js';
import { A } from '@solidjs/router';
import { MainLayout } from '@components/layout/MainLayout';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { cartStore } from '@state/cart.store';
import { authStore } from '@state/auth.store';
import { formatMoney, ivaOf, priceWithIva } from '@core/entities/cart.entity';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Banknote,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
} from 'lucide-solid';

const thStyle = {
  padding: '12px 14px',
  'text-align': 'left',
  'font-size': '12px',
  'font-weight': '700',
  color: 'var(--text-muted)',
  'text-transform': 'uppercase',
  'letter-spacing': '0.4px',
  'border-bottom': '1px solid var(--border-color)',
  'white-space': 'nowrap',
} as const;

const tdStyle = {
  padding: '14px',
  'font-size': '14px',
  color: 'var(--app-white)',
  'border-bottom': '1px solid var(--border-color)',
  'vertical-align': 'middle',
} as const;

const qtyBtnStyle = {
  width: '28px',
  height: '28px',
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center',
  'border-radius': '50%',
  border: '1px solid var(--border-color)',
  'background-color': 'var(--app-dark-300)',
  color: 'var(--app-white)',
  cursor: 'pointer',
} as const;

export const CartPage: Component = () => {
  const [address, setAddress] = createSignal('');
  const [addressError, setAddressError] = createSignal<string | null>(null);

  const isCustomer = () => authStore.userRole() === 'CUSTOMER';

  const handleCheckout = async () => {
    const value = address().trim();
    if (value.length < 5) {
      setAddressError('La dirección de entrega debe tener al menos 5 caracteres');
      return;
    }
    if (value.length > 255) {
      setAddressError('La dirección no puede exceder 255 caracteres');
      return;
    }
    setAddressError(null);
        const order = await cartStore.checkout(value);
    if (order) setAddress('');
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '24px' }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-wrap': 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
              <h1 style={{ 'font-size': '28px', 'font-weight': '800', color: 'var(--app-white)', margin: '0' }}>
                Carrito de Compras
              </h1>
              <span
                style={{
                  'background-color': 'var(--app-green-light)',
                  color: 'var(--app-green)',
                  padding: '4px 10px',
                  'border-radius': 'var(--radius-pill)',
                  'font-size': '12px',
                  'font-weight': '700',
                }}
              >
                RF-04 & RF-05
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', 'font-size': '14px', 'margin-top': '4px' }}>
              Revisa tus productos, el IVA (13%) y confirma tu pedido.
            </p>
          </div>
          <A href="/catalog" style={{ 'text-decoration': 'none' }}>
            <Button variant="outline" size="sm" icon={<ArrowLeft size={14} />}>
              Seguir comprando
            </Button>
          </A>
        </div>

        {/* Confirmación de pedido (respuesta 201 del backend) */}
        <Show when={cartStore.lastOrder()}>
          {(order) => (
            <div
              class="animate-fade-in"
              style={{
                padding: '20px',
                'background-color': 'var(--app-green-light)',
                border: '1px solid var(--app-green)',
                'border-radius': 'var(--radius-lg)',
                display: 'flex',
                'flex-direction': 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', 'align-items': 'center', gap: '10px', color: 'var(--app-green)', 'font-weight': '800', 'font-size': '16px' }}>
                <CheckCircle2 size={22} />
                ¡Pedido confirmado! Estado: {order().status}
              </div>
              <div style={{ color: 'var(--app-white)', 'font-size': '14px', display: 'grid', gap: '4px' }}>
                <span>N.º de pedido: <strong>{order().id}</strong></span>
                <span>Entrega en: {order().deliveryAddress}</span>
                <span>Pago: Efectivo contra entrega (al recibir el pedido)</span>
                <span>
                  Subtotal: {formatMoney(order().subtotal)} · IVA 13%: {formatMoney(order().taxAmount)} ·{' '}
                  <strong>Total: {formatMoney(order().total)}</strong>
                </span>
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={() => cartStore.clearLastOrder()}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </Show>

        {/* Error del checkout (400 / 404 / 409 del backend) */}
        <Show when={cartStore.checkoutError()}>
          <div
            style={{
              padding: '16px',
              'background-color': 'var(--app-danger-light)',
              border: '1px solid var(--app-danger)',
              'border-radius': 'var(--radius-md)',
              color: 'var(--app-danger)',
              display: 'flex',
              'align-items': 'center',
              gap: '10px',
              'font-size': '14px',
            }}
          >
            <AlertCircle size={20} />
            <span style={{ flex: '1' }}>{cartStore.checkoutError()}</span>
            <Button variant="ghost" size="sm" onClick={() => cartStore.clearCheckoutError()}>
              ✕
            </Button>
          </div>
        </Show>

        {/* Carrito vacío */}
        <Show when={cartStore.isEmpty()}>
          <div
            style={{
              padding: '60px 20px',
              'text-align': 'center',
              'background-color': 'var(--app-dark-100)',
              border: '1px solid var(--border-color)',
              'border-radius': 'var(--radius-lg)',
              display: 'flex',
              'flex-direction': 'column',
              'align-items': 'center',
              gap: '12px',
            }}
          >
            <ShoppingBag size={48} color="var(--text-muted)" />
            <h3 style={{ color: 'var(--app-white)', 'font-size': '18px', margin: '0' }}>Tu carrito está vacío</h3>
            <p style={{ color: 'var(--text-muted)', 'font-size': '14px', margin: '0' }}>
              Agrega productos desde el catálogo.
            </p>
            <A href="/catalog" style={{ 'text-decoration': 'none' }}>
              <Button variant="primary" size="sm" icon={<ShoppingCart size={14} />}>
                Ir al catálogo
              </Button>
            </A>
          </div>
        </Show>

        <Show when={!cartStore.isEmpty()}>
          {/* Tabla de productos con precio sin IVA / con IVA */}
          <div
            style={{
              'background-color': 'var(--app-dark-100)',
              border: '1px solid var(--border-color)',
              'border-radius': 'var(--radius-lg)',
              'overflow-x': 'auto',
            }}
          >
            <table style={{ width: '100%', 'border-collapse': 'collapse', 'min-width': '860px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Producto</th>
                  <th style={{ ...thStyle, 'text-align': 'right' }}>Precio sin IVA</th>
                  <th style={{ ...thStyle, 'text-align': 'right' }}>IVA (13%)</th>
                  <th style={{ ...thStyle, 'text-align': 'right' }}>Precio con IVA</th>
                  <th style={{ ...thStyle, 'text-align': 'center' }}>Cantidad</th>
                  <th style={{ ...thStyle, 'text-align': 'right' }}>Subtotal sin IVA</th>
                  <th style={{ ...thStyle, 'text-align': 'right' }}>Subtotal con IVA</th>
                  <th style={{ ...thStyle, 'text-align': 'center' }}>Quitar</th>
                </tr>
              </thead>
              <tbody>
                <For each={cartStore.items}>
                  {(item) => (
                    <tr>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              'border-radius': 'var(--radius-sm)',
                              'background-color': 'var(--app-dark-300)',
                              overflow: 'hidden',
                              display: 'flex',
                              'align-items': 'center',
                              'justify-content': 'center',
                              'flex-shrink': '0',
                            }}
                          >
                            <Show when={item.imageUrl} fallback={<ShoppingBag size={18} color="var(--text-muted)" />}>
                              <img src={item.imageUrl!} alt={item.name} style={{ width: '100%', height: '100%', 'object-fit': 'cover' }} />
                            </Show>
                          </div>
                          <div>
                            <div style={{ 'font-weight': '700' }}>{item.name}</div>
                            <div style={{ 'font-size': '12px', color: 'var(--text-muted)' }}>Disponibles: {item.stock}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, 'text-align': 'right' }}>{formatMoney(item.unitPrice)}</td>
                      <td style={{ ...tdStyle, 'text-align': 'right', color: 'var(--text-secondary)' }}>
                        {formatMoney(ivaOf(item.unitPrice))}
                      </td>
                      <td style={{ ...tdStyle, 'text-align': 'right', 'font-weight': '700' }}>
                        {formatMoney(priceWithIva(item.unitPrice))}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'center', gap: '10px' }}>
                          <button style={qtyBtnStyle} onClick={() => cartStore.decrement(item.productId)} title="Quitar uno">
                            <Minus size={14} />
                          </button>
                          <span style={{ 'min-width': '24px', 'text-align': 'center', 'font-weight': '700' }}>{item.quantity}</span>
                          <button
                            style={{ ...qtyBtnStyle, opacity: item.quantity >= item.stock ? '0.4' : '1' }}
                            disabled={item.quantity >= item.stock}
                            onClick={() => cartStore.increment(item.productId)}
                            title="Agregar uno"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, 'text-align': 'right' }}>{formatMoney(cartStore.lineSubtotal(item))}</td>
                      <td style={{ ...tdStyle, 'text-align': 'right', 'font-weight': '700', color: 'var(--app-green)' }}>
                        {formatMoney(cartStore.lineSubtotalWithIva(item))}
                      </td>
                      <td style={{ ...tdStyle, 'text-align': 'center' }}>
                        <button
                          onClick={() => cartStore.removeItem(item.productId)}
                          title="Eliminar del carrito"
                          style={{ ...qtyBtnStyle, margin: '0 auto', color: 'var(--app-danger)', 'border-color': 'var(--app-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>

          {/* Resumen + Checkout */}
          <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Datos de entrega */}
            <div
              style={{
                'background-color': 'var(--app-dark-100)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                'flex-direction': 'column',
                gap: '16px',
              }}
            >
              <h3 style={{ margin: '0', color: 'var(--app-white)', 'font-size': '17px' }}>Datos de entrega</h3>
              <Input
                label="Dirección de entrega"
                placeholder="Ej: 4a Calle Poniente, San Miguel"
                value={address()}
                onInput={(e) => setAddress(e.currentTarget.value)}
                error={addressError() ?? undefined}
                icon={<MapPin size={16} />}
                maxLength={255}
              />
              {/* Método de pago único: efectivo contra entrega (pasarelas de tarjeta excluidas) */}
              <div>
                <span style={{ 'font-size': '13px', 'font-weight': '600', color: 'var(--app-gray-300)' }}>Método de pago</span>
                <div
                  style={{
                    display: 'flex',
                    'align-items': 'center',
                    gap: '12px',
                    'margin-top': '6px',
                    padding: '12px 14px',
                    'border-radius': 'var(--radius-md)',
                    border: '1px solid var(--app-green)',
                    'background-color': 'var(--app-green-light)',
                    color: 'var(--app-green)',
                  }}
                >
                  <Banknote size={20} />
                  <div style={{ flex: '1' }}>
                    <div style={{ 'font-weight': '700', 'font-size': '14px' }}>Efectivo contra entrega</div>
                    <div style={{ 'font-size': '12px', color: 'var(--text-secondary)' }}>
                      Pagas al repartidor cuando recibes tu pedido. Pagos con tarjeta no disponibles.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de totales */}
            <div
              style={{
                'background-color': 'var(--app-dark-100)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                'flex-direction': 'column',
                gap: '12px',
              }}
            >
              <h3 style={{ margin: '0', color: 'var(--app-white)', 'font-size': '17px' }}>Resumen del pedido</h3>
              <div style={{ display: 'flex', 'justify-content': 'space-between', color: 'var(--text-secondary)', 'font-size': '14px' }}>
                <span>Unidades</span>
                <span>{cartStore.totals().itemsCount}</span>
              </div>
              <div style={{ display: 'flex', 'justify-content': 'space-between', color: 'var(--text-secondary)', 'font-size': '14px' }}>
                <span>Subtotal (sin IVA)</span>
                <span>{formatMoney(cartStore.totals().subtotal)}</span>
              </div>
              <div style={{ display: 'flex', 'justify-content': 'space-between', color: 'var(--text-secondary)', 'font-size': '14px' }}>
                <span>IVA (13%)</span>
                <span>{formatMoney(cartStore.totals().taxAmount)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  'justify-content': 'space-between',
                  'border-top': '1px solid var(--border-color)',
                  'padding-top': '12px',
                  color: 'var(--app-white)',
                  'font-size': '20px',
                  'font-weight': '800',
                }}
              >
                <span>Total (con IVA)</span>
                <span style={{ color: 'var(--app-green)' }}>{formatMoney(cartStore.totals().total)}</span>
              </div>

              <Show when={!isCustomer()}>
                <div style={{ 'font-size': '13px', color: 'var(--app-danger)' }}>
                  Solo usuarios con rol CLIENTE pueden confirmar pedidos.
                </div>
              </Show>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                isLoading={cartStore.isSubmitting()}
                disabled={!isCustomer() || cartStore.isEmpty()}
                onClick={handleCheckout}
                icon={<ShoppingCart size={18} />}
              >
                Confirmar pedido
              </Button>
              <Button variant="ghost" size="sm" onClick={() => cartStore.clear()} icon={<Trash2 size={14} />}>
                Vaciar carrito
              </Button>
            </div>
          </div>
        </Show>
      </div>
    </MainLayout>
  );
};