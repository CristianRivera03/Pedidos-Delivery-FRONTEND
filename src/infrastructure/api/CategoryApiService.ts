import { ICategoryService } from '@core/contracts/ICategoryService';
import { IHttpClient } from '@core/contracts/IHttpClient';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@core/entities/category.entity';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export class CategoryApiService implements ICategoryService {
  constructor(private httpClient: IHttpClient) {}

  async getCategories(filter?: { activeOnly?: boolean }): Promise<Category[]> {
    const params: Record<string, string> = {};
    if (filter?.activeOnly !== undefined) {
      params.activeOnly = String(filter.activeOnly);
    }
    const response = await this.httpClient.get<ApiResponse<Category[]>>('/categories', { params });
    return response.data || [];
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await this.httpClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  }

  async createCategory(dto: CreateCategoryDTO, token: string): Promise<Category> {
    const response = await this.httpClient.post<ApiResponse<Category>>('/categories', dto, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async updateCategory(id: string, dto: UpdateCategoryDTO, token: string): Promise<Category> {
    const response = await this.httpClient.patch<ApiResponse<Category>>(`/categories/${id}`, dto, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async deleteCategory(id: string, token: string): Promise<void> {
    await this.httpClient.delete<void>(`/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
