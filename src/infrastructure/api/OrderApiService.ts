import { IOrderService } from '@core/contracts/IOrderService';
import { IHttpClient } from '@core/contracts/IHttpClient';
import { CheckoutDTO, Order } from '@core/entities/order.entity';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export class OrderApiService implements IOrderService {
  constructor(private httpClient: IHttpClient) {}

  async checkout(dto: CheckoutDTO, token: string): Promise<Order> {
    const response = await this.httpClient.post<ApiResponse<Order>>('/orders', dto, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async getOrderById(id: string, token: string): Promise<Order> {
    const response = await this.httpClient.get<ApiResponse<Order>>(`/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}