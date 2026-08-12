export type UserRole = 'ADMIN' | 'CUSTOMER' | 'DELIVERY' | 'RESTAURANT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  password?: string;
  role?: UserRole;
}
