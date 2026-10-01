import { CheckoutDTO, Order } from '@core/entities/order.entity';

export interface IOrderService {
  checkout(dto: CheckoutDTO, token: string): Promise<Order>;
  getOrderById(id: string, token: string): Promise<Order>;
}