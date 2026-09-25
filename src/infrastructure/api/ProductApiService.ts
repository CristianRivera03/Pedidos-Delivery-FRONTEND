import { IProductService } from '@core/contracts/IProductService';
import { IHttpClient } from '@core/contracts/IHttpClient';
import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilterOptions,
  PaginatedProductsResult,
  PaginationMeta,
} from '@core/entities/product.entity';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
}

export class ProductApiService implements IProductService {
  constructor(private httpClient: IHttpClient) {}

  async getProducts(filter?: ProductFilterOptions): Promise<PaginatedProductsResult> {
    const params: Record<string, string> = {};
    if (filter?.categoryId) params.categoryId = filter.categoryId;
    if (filter?.search) params.search = filter.search;
    if (filter?.activeOnly !== undefined) params.activeOnly = String(filter.activeOnly);
    if (filter?.all !== undefined) params.all = String(filter.all);
    if (filter?.page !== undefined) params.page = String(filter.page);
    if (filter?.limit !== undefined) params.limit = String(filter.limit);

    const response = await this.httpClient.get<ApiResponse<Product[]>>('/products', { params });
    return {
      items: response.data || [],
      pagination: response.pagination,
    };
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.httpClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  }

  async createProduct(dto: CreateProductDTO, token: string): Promise<Product> {
    const response = await this.httpClient.post<ApiResponse<Product>>('/products', dto, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async updateProduct(id: string, dto: UpdateProductDTO, token: string): Promise<Product> {
    const response = await this.httpClient.patch<ApiResponse<Product>>(`/products/${id}`, dto, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async deleteProduct(id: string, token: string): Promise<void> {
    await this.httpClient.delete<void>(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
