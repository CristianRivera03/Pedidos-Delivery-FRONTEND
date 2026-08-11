import { AuthResponse, LoginCredentials, RegisterCredentials } from '../entities/auth.entity';
import { User } from '../entities/user.entity';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(credentials: RegisterCredentials): Promise<AuthResponse>;
  getCurrentUser(token: string): Promise<User>;
}
