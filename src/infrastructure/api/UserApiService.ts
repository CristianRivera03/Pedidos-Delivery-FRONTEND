import { IUserService } from '@core/contracts/IUserService';
import { IHttpClient } from '@core/contracts/IHttpClient';
import { User, CreateUserDTO } from '@core/entities/user.entity';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export class UserApiService implements IUserService {
  constructor(private httpClient: IHttpClient) {}

  async getUsers(token: string): Promise<User[]> {
    const response = await this.httpClient.get<ApiResponse<User[]>>('/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async getUserById(id: string, token: string): Promise<User> {
    const response = await this.httpClient.get<ApiResponse<User>>(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async createUser(dto: CreateUserDTO, token: string): Promise<User> {
    const response = await this.httpClient.post<ApiResponse<User>>('/users', dto, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async deleteUser(id: string, token: string): Promise<void> {
    await this.httpClient.delete<ApiResponse<void>>(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
