// RF-05: Entidades de Orden (reflejan el OrderDto del backend)

export type OrderStatus = 'CREADO' | 'PAGADO' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
export type PaymentMethod = 'CARD' | 'CASH';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  cashCollectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Body que espera POST /orders
export interface CheckoutDTO {
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  items: { productId: string; quantity: number }[];
}