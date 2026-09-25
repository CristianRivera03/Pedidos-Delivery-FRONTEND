import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@core/entities/category.entity';

export interface ICategoryService {
  getCategories(filter?: { activeOnly?: boolean }): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category>;
  createCategory(dto: CreateCategoryDTO, token: string): Promise<Category>;
  updateCategory(id: string, dto: UpdateCategoryDTO, token: string): Promise<Category>;
  deleteCategory(id: string, token: string): Promise<void>;
}
