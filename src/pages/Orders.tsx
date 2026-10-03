import { Component, For, Show, createSignal, onMount } from 'solid-js';
import { MainLayout } from '@components/layout/MainLayout';
import { authStore } from '@state/auth.store';
import { orderService } from '@infrastructure/services';
import { Order, OrderStatus } from '@core/entities/order.entity';
import { Button } from '@components/ui/Button';
import {
  Package,
  RefreshCw,
  MapPin,
  CreditCard,
  CircleDollarSign,
  ChevronRight,
  XCircle,
  CheckCircle2,
  Clock3,
  Truck,
  ChefHat,
} from 'lucide-solid';

const statusLabels: Record<OrderStatus, string> = {
  CREADO: 'Creado',
  PAGADO: 'Pagado',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const getNextStatus = (status: OrderStatus): OrderStatus | null => {
  switch (status) {
    case 'PAGADO':
      return 'EN_PREPARACION';

    case 'EN_PREPARACION':
      return 'EN_CAMINO';

    case 'EN_CAMINO':
      return 'ENTREGADO';

    default:
      return null;
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'CREADO':
      return Package;

    case 'PAGADO':
      return CreditCard;

    case 'EN_PREPARACION':
      return ChefHat;

    case 'EN_CAMINO':
      return Truck;

    case 'ENTREGADO':
      return CheckCircle2;

    case 'CANCELADO':
      return XCircle;

    default:
      return Package;
  }
};

const getStatusClass = (status: OrderStatus): string => {
  switch (status) {
    case 'CREADO':
      return 'status-created';

    case 'PAGADO':
      return 'status-paid';

    case 'EN_PREPARACION':
      return 'status-preparing';

    case 'EN_CAMINO':
      return 'status-delivery';

    case 'ENTREGADO':
      return 'status-delivered';

    case 'CANCELADO':
      return 'status-cancelled';

    default:
      return 'status-created';
  }
};

export const OrdersPage: Component = () => {
  const [orders, setOrders] = createSignal<Order[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [updatingId, setUpdatingId] = createSignal<string | null>(null);

  const loadOrders = async () => {
    const token = authStore.token();

    if (!token) {
      setError('No hay una sesión activa.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await orderService.listOrders(token, {
        page: 1,
        limit: 100,
      });

      setOrders(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los pedidos.',
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    const token = authStore.token();

    if (!token) {
      setError('No hay una sesión activa.');
      return;
    }

    setUpdatingId(orderId);
    setError(null);

    try {
      const updatedOrder = await orderService.updateOrderStatus(
        orderId,
        newStatus,
        token,
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el estado del pedido.',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const canAdvance = (order: Order): boolean => {
    const role = authStore.userRole();

    if (!role) {
      return false;
    }

    if (order.status === 'PAGADO') {
      return role === 'ADMIN' || role === 'RESTAURANT';
    }

    if (order.status === 'EN_PREPARACION') {
      return role === 'ADMIN' || role === 'DELIVERY';
    }

    if (order.status === 'EN_CAMINO') {
      return role === 'ADMIN' || role === 'DELIVERY';
    }

    return false;
  };

  const canCancel = (order: Order): boolean => {
    const role = authStore.userRole();

    if (!role) {
      return false;
    }

    if (
      order.status !== 'PAGADO' &&
      order.status !== 'EN_PREPARACION'
    ) {
      return false;
    }

    if (role === 'ADMIN') {
      return true;
    }

    return (
      role === 'CUSTOMER' &&
      order.userId === authStore.user()?.id
    );
  };

  onMount(loadOrders);

  return (
    <MainLayout>
      <div class="orders-page">
        <style>{`
          .orders-page {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .orders-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
          }

          .orders-heading {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .orders-heading-icon {
            width: 48px;
            height: 48px;
            min-width: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--app-green-light);
            color: var(--app-green);
            border: 1px solid rgba(0, 210, 106, 0.18);
          }

          .orders-title {
            margin: 0;
            color: var(--app-white);
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }

          .orders-subtitle {
            margin: 5px 0 0;
            color: var(--text-secondary);
            font-size: 14px;
          }

          .orders-header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .role-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 12px;
            border-radius: var(--radius-pill);
            background: var(--app-dark-100);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 12px;
          }

          .role-badge strong {
            color: var(--app-green);
          }

          .orders-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .orders-summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
          }

          .summary-card {
            background: var(--app-dark-100);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .summary-icon {
            width: 38px;
            height: 38px;
            min-width: 38px;
            border-radius: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--app-dark-200);
            color: var(--app-green);
          }

          .summary-label {
            display: block;
            color: var(--text-muted);
            font-size: 12px;
            margin-bottom: 3px;
          }

          .summary-value {
            display: block;
            color: var(--app-white);
            font-size: 20px;
            font-weight: 800;
          }

          .error-message {
            padding: 14px 16px;
            border-radius: var(--radius-md);
            border: 1px solid rgba(225, 25, 0, 0.35);
            background: rgba(225, 25, 0, 0.10);
            color: #ff8c80;
            font-size: 14px;
          }

          .loading-card,
          .empty-card {
            background: var(--app-dark-100);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 55px 25px;
            text-align: center;
            color: var(--text-secondary);
          }

          .loading-icon {
            width: 34px;
            height: 34px;
            margin: 0 auto 12px;
            color: var(--app-green);
            animation: orders-spin 1s linear infinite;
          }

          @keyframes orders-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .orders-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .order-card {
            background: var(--app-dark-100);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            overflow: hidden;
            transition: border-color 0.2s ease, transform 0.2s ease;
          }

          .order-card:hover {
            border-color: rgba(0, 210, 106, 0.25);
            transform: translateY(-1px);
          }

          .order-card-header {
            padding: 18px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            flex-wrap: wrap;
            border-bottom: 1px solid var(--border-color);
          }

          .order-title-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .order-icon {
            width: 40px;
            height: 40px;
            min-width: 40px;
            border-radius: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--app-green-light);
            color: var(--app-green);
          }

          .order-id {
            margin: 0;
            color: var(--app-white);
            font-size: 16px;
            font-weight: 800;
          }

          .order-date {
            display: block;
            margin-top: 3px;
            color: var(--text-muted);
            font-size: 12px;
          }

          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 11px;
            border-radius: var(--radius-pill);
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }

          .status-created {
            background: rgba(255, 255, 255, 0.07);
            color: #bdbdbd;
            border: 1px solid rgba(255, 255, 255, 0.10);
          }

          .status-paid {
            background: rgba(39, 110, 241, 0.12);
            color: #69a8ff;
            border: 1px solid rgba(39, 110, 241, 0.22);
          }

          .status-preparing {
            background: rgba(255, 183, 3, 0.12);
            color: #ffd85c;
            border: 1px solid rgba(255, 183, 3, 0.22);
          }

          .status-delivery {
            background: rgba(130, 80, 220, 0.12);
            color: #b894ff;
            border: 1px solid rgba(130, 80, 220, 0.22);
          }

          .status-delivered {
            background: rgba(0, 210, 106, 0.12);
            color: var(--app-green);
            border: 1px solid rgba(0, 210, 106, 0.22);
          }

          .status-cancelled {
            background: rgba(225, 25, 0, 0.10);
            color: #ff7777;
            border: 1px solid rgba(225, 25, 0, 0.25);
          }

          .order-body {
            padding: 20px;
          }

          .order-info-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr 0.8fr;
            gap: 12px;
            margin-bottom: 20px;
          }

          .info-card {
            background: var(--app-dark-200);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 14px;
            min-width: 0;
          }

          .info-card-header {
            display: flex;
            align-items: center;
            gap: 7px;
            color: var(--text-muted);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 7px;
          }

          .info-card-value {
            color: var(--app-white);
            font-size: 14px;
            font-weight: 650;
            word-break: break-word;
          }

          .info-card-value.total {
            color: var(--app-green);
            font-size: 18px;
          }

          .products-section {
            margin-bottom: 18px;
          }

          .products-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 10px;
            color: var(--app-white);
            font-size: 14px;
            font-weight: 750;
          }

          .product-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 10px 0;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 13px;
          }

          .product-row:last-child {
            border-bottom: none;
          }

          .product-name {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .product-quantity {
            color: var(--text-muted);
          }

          .product-price {
            color: var(--app-white);
            font-weight: 700;
            white-space: nowrap;
          }

          .order-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            padding-top: 17px;
            border-top: 1px solid var(--border-color);
          }

          .action-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            border: none;
            border-radius: var(--radius-md);
            padding: 10px 15px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: var(--transition-fast);
          }

          .advance-button {
            background: var(--app-green);
            color: #000000;
          }

          .advance-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(0, 210, 106, 0.18);
          }

          .cancel-button {
            background: rgba(225, 25, 0, 0.10);
            color: #ff7777;
            border: 1px solid rgba(225, 25, 0, 0.30);
          }

          .cancel-button:hover {
            background: rgba(225, 25, 0, 0.18);
          }

          .action-button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none;
          }

          .order-finished {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-muted);
            font-size: 13px;
            padding-top: 3px;
          }

          .finished-icon {
            color: var(--app-green);
          }

          @media (max-width: 900px) {
            .orders-summary {
              grid-template-columns: repeat(2, 1fr);
            }

            .order-info-grid {
              grid-template-columns: 1fr 1fr;
            }

            .order-info-grid .info-card:last-child {
              grid-column: span 2;
            }
          }

          @media (max-width: 640px) {
            .orders-header {
              align-items: stretch;
            }

            .orders-header-actions {
              width: 100%;
              flex-direction: column;
              align-items: stretch;
            }

            .orders-summary {
              grid-template-columns: 1fr 1fr;
            }

            .order-info-grid {
              grid-template-columns: 1fr;
            }

            .order-info-grid .info-card:last-child {
              grid-column: auto;
            }

            .order-card-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .order-body {
              padding: 16px;
            }

            .order-actions {
              flex-direction: column;
              align-items: stretch;
            }

            .action-button {
              width: 100%;
            }
          }

          @media (max-width: 420px) {
            .orders-heading {
              align-items: flex-start;
            }

            .orders-title {
              font-size: 24px;
            }

            .orders-summary {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        {/* ENCABEZADO */}
        <div class="orders-header">
          <div>
            <div class="orders-heading">
              <div class="orders-heading-icon">
                <Package size={24} />
              </div>

              <div>
                <h1 class="orders-title">
                  Gestión de Pedidos
                </h1>

                <p class="orders-subtitle">
                  Seguimiento y ciclo de vida de los pedidos
                </p>
              </div>
            </div>
          </div>

          <div class="orders-header-actions">
            <div class="role-badge">
              <span>Rol actual:</span>
              <strong>
                {authStore.userRole() ?? 'Sin rol'}
              </strong>
            </div>

            <Button
              variant="primary"
              icon={<RefreshCw size={16} />}
              onClick={loadOrders}
              disabled={loading()}
            >
              {loading() ? 'Actualizando...' : 'Actualizar pedidos'}
            </Button>
          </div>
        </div>

        {/* RESUMEN */}
        <div class="orders-summary">
          <div class="summary-card">
            <div class="summary-icon">
              <Package size={18} />
            </div>

            <div>
              <span class="summary-label">
                Total pedidos
              </span>

              <span class="summary-value">
                {orders().length}
              </span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">
              <Clock3 size={18} />
            </div>

            <div>
              <span class="summary-label">
                En preparación
              </span>

              <span class="summary-value">
                {
                  orders().filter(
                    (order) => order.status === 'EN_PREPARACION',
                  ).length
                }
              </span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">
              <Truck size={18} />
            </div>

            <div>
              <span class="summary-label">
                En camino
              </span>

              <span class="summary-value">
                {
                  orders().filter(
                    (order) => order.status === 'EN_CAMINO',
                  ).length
                }
              </span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <span class="summary-label">
                Entregados
              </span>

              <span class="summary-value">
                {
                  orders().filter(
                    (order) => order.status === 'ENTREGADO',
                  ).length
                }
              </span>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div class="orders-content">
          <Show when={error()}>
            <div class="error-message">
              {error()}
            </div>
          </Show>

          <Show
            when={!loading()}
            fallback={
              <div class="loading-card">
                <RefreshCw class="loading-icon" size={34} />
                Cargando pedidos...
              </div>
            }
          >
            <Show
              when={orders().length > 0}
              fallback={
                <div class="empty-card">
                  <Package
                    size={42}
                    style={{
                      color: 'var(--text-muted)',
                      margin: '0 auto 12px',
                    }}
                  />

                  <div>
                    No hay pedidos para mostrar.
                  </div>
                </div>
              }
            >
              <div class="orders-list">
                <For each={orders()}>
                  {(order) => {
                    const nextStatus = getNextStatus(order.status);
                    const StatusIcon = getStatusIcon(order.status);

                    const isUpdating = () =>
                      updatingId() === order.id;

                    return (
                      <div class="order-card">
                        {/* HEADER DEL PEDIDO */}
                        <div class="order-card-header">
                          <div class="order-title-wrapper">
                            <div class="order-icon">
                              <StatusIcon size={19} />
                            </div>

                            <div>
                              <h2 class="order-id">
                                Pedido #{order.id.slice(0, 8)}
                              </h2>

                              <span class="order-date">
                                {new Date(
                                  order.createdAt,
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <span
                            class={`status-badge ${getStatusClass(
                              order.status,
                            )}`}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </div>

                        {/* CUERPO */}
                        <div class="order-body">
                          {/* INFORMACIÓN */}
                          <div class="order-info-grid">
                            <div class="info-card">
                              <div class="info-card-header">
                                <MapPin size={13} />
                                Dirección
                              </div>

                              <div class="info-card-value">
                                {order.deliveryAddress}
                              </div>
                            </div>

                            <div class="info-card">
                              <div class="info-card-header">
                                <CreditCard size={13} />
                                Método de pago
                              </div>

                              <div class="info-card-value">
                                {order.paymentMethod}
                              </div>
                            </div>

                            <div class="info-card">
                              <div class="info-card-header">
                                <CircleDollarSign size={13} />
                                Total
                              </div>

                              <div class="info-card-value total">
                                ${order.total.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          {/* PRODUCTOS */}
                          <div class="products-section">
                            <h3 class="products-title">
                              <Package size={16} />
                              Productos
                            </h3>

                            <Show
                              when={
                                order.items &&
                                order.items.length > 0
                              }
                              fallback={
                                <div
                                  style={{
                                    color:
                                      'var(--text-muted)',
                                    'font-size': '13px',
                                    padding: '8px 0',
                                  }}
                                >
                                  No hay productos registrados.
                                </div>
                              }
                            >
                              <For each={order.items ?? []}>
                                {(item) => (
                                  <div class="product-row">
                                    <div class="product-name">
                                      <span>
                                        {item.productName}
                                      </span>

                                      <span class="product-quantity">
                                        x {item.quantity}
                                      </span>
                                    </div>

                                    <span class="product-price">
                                      $
                                      {item.subtotal.toFixed(
                                        2,
                                      )}
                                    </span>
                                  </div>
                                )}
                              </For>
                            </Show>
                          </div>

                          {/* ACCIONES */}
                          <Show
                            when={
                              (canAdvance(order) &&
                                nextStatus) ||
                              canCancel(order)
                            }
                            fallback={
                              <Show
                                when={
                                  order.status ===
                                    'ENTREGADO' ||
                                  order.status ===
                                    'CANCELADO'
                                }
                              >
                                <div class="order-finished">
                                  <CheckCircle2
                                    class="finished-icon"
                                    size={16}
                                  />

                                  Pedido finalizado
                                </div>
                              </Show>
                            }
                          >
                            <div class="order-actions">
                              <Show
                                when={
                                  canAdvance(order) &&
                                  nextStatus
                                }
                              >
                                <button
                                  class="action-button advance-button"
                                  type="button"
                                  disabled={isUpdating()}
                                  onClick={() =>
                                    updateStatus(
                                      order.id,
                                      nextStatus!,
                                    )
                                  }
                                >
                                  <ChevronRight size={16} />

                                  {isUpdating()
                                    ? 'Actualizando...'
                                    : `Cambiar a ${
                                        statusLabels[
                                          nextStatus!
                                        ]
                                      }`}
                                </button>
                              </Show>

                              <Show
                                when={canCancel(order)}
                              >
                                <button
                                  class="action-button cancel-button"
                                  type="button"
                                  disabled={isUpdating()}
                                  onClick={() =>
                                    updateStatus(
                                      order.id,
                                      'CANCELADO',
                                    )
                                  }
                                >
                                  <XCircle size={16} />

                                  {isUpdating()
                                    ? 'Actualizando...'
                                    : 'Cancelar pedido'}
                                </button>
                              </Show>
                            </div>
                          </Show>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </MainLayout>
  );
};