import {
  CheckoutDTO,
  Order,
  OrderStatus,
} from '@core/entities/order.entity';

export interface IOrderService {
  checkout(dto: CheckoutDTO, token: string): Promise<Order>;

  getOrderById(id: string, token: string): Promise<Order>;

  listOrders(
    token: string,
    params?: {
      status?: OrderStatus;
      page?: number;
      limit?: number;
    },
  ): Promise<Order[]>;

  updateOrderStatus(
    id: string,
    status: OrderStatus,
    token: string,
  ): Promise<Order>;
}