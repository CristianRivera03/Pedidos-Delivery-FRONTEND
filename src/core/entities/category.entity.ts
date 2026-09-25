export interface Category {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}
