import { IOrderService } from '@core/contracts/IOrderService';
import { IHttpClient } from '@core/contracts/IHttpClient';
import {
  CheckoutDTO,
  Order,
  OrderStatus,
} from '@core/entities/order.entity';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ListOrdersData {
  items: Order[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class OrderApiService implements IOrderService {
  constructor(private httpClient: IHttpClient) {}

  async checkout(
    dto: CheckoutDTO,
    token: string,
  ): Promise<Order> {
    const response = await this.httpClient.post<ApiResponse<Order>>(
      '/orders',
      dto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }

  async getOrderById(
    id: string,
    token: string,
  ): Promise<Order> {
    const response = await this.httpClient.get<ApiResponse<Order>>(
      `/orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }

  async listOrders(
    token: string,
    params?: {
      status?: OrderStatus;
      page?: number;
      limit?: number;
    },
  ): Promise<Order[]> {
    const queryParams: Record<string, string> = {};

    if (params?.status) {
      queryParams.status = params.status;
    }

    if (params?.page !== undefined) {
      queryParams.page = String(params.page);
    }

    if (params?.limit !== undefined) {
      queryParams.limit = String(params.limit);
    }

    const response = await this.httpClient.get<
      ApiResponse<Order[] | ListOrdersData>
    >('/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: queryParams,
    });

    /*
     * El backend puede devolver la lista de pedidos
     * directamente en data:
     *
     * {
     *   success: true,
     *   data: [...]
     * }
     */

    if (Array.isArray(response.data)) {
      return response.data;
    }

    /*
     * También soportamos una respuesta donde data
     * contiene items:
     *
     * {
     *   success: true,
     *   data: {
     *     items: [...]
     *   }
     * }
     */

    if (
      response.data &&
      'items' in response.data &&
      Array.isArray(response.data.items)
    ) {
      return response.data.items;
    }

    // Si la respuesta no contiene pedidos,
    // devolvemos un arreglo vacío para evitar
    // errores como: Cannot read properties of undefined
    return [];
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    token: string,
  ): Promise<Order> {
    const response = await this.httpClient.patch<ApiResponse<Order>>(
      `/orders/${id}/status`,
      {
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }
}