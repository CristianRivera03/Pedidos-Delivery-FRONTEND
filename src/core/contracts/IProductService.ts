import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilterOptions,
  PaginatedProductsResult,
} from '@core/entities/product.entity';

export interface IProductService {
  getProducts(filter?: ProductFilterOptions): Promise<PaginatedProductsResult>;
  getProductById(id: string): Promise<Product>;
  createProduct(dto: CreateProductDTO, token: string): Promise<Product>;
  updateProduct(id: string, dto: UpdateProductDTO, token: string): Promise<Product>;
  deleteProduct(id: string, token: string): Promise<void>;
}
