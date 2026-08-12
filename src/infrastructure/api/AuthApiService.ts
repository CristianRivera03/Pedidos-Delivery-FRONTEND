import { IAuthService } from '@core/contracts/IAuthService';
import { IHttpClient } from '@core/contracts/IHttpClient';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@core/entities/auth.entity';
import { User } from '@core/entities/user.entity';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class AuthApiService implements IAuthService {
  constructor(private httpClient: IHttpClient) {}

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.httpClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.httpClient.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    return response.data;
  }

  async getCurrentUser(token: string): Promise<User> {
    const response = await this.httpClient.get<ApiResponse<User>>('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}
