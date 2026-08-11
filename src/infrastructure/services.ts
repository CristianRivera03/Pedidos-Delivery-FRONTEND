import { ENV } from '@config/env';
import { FetchHttpClient } from './http/FetchHttpClient';
import { AuthApiService } from './api/AuthApiService';
import { UserApiService } from './api/UserApiService';
import { IAuthService } from '@core/contracts/IAuthService';
import { IUserService } from '@core/contracts/IUserService';

// Composition Root para inyección de dependencias en el Frontend
const httpClient = new FetchHttpClient(ENV.API_BASE_URL);

export const authService: IAuthService = new AuthApiService(httpClient);
export const userService: IUserService = new UserApiService(httpClient);
