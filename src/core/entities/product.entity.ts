export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDTO {
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
}

export interface UpdateProductDTO {
  categoryId?: string;
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface ProductFilterOptions {
  categoryId?: string;
  search?: string;
  activeOnly?: boolean;
  page?: number;
  limit?: number;
  all?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedProductsResult {
  items: Product[];
  pagination?: PaginationMeta;
}
