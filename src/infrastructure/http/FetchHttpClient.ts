import { IHttpClient, HttpRequestOptions } from '@core/contracts/IHttpClient';
import { ApiError } from '@core/errors/ApiError';

export class FetchHttpClient implements IHttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value);
        }
      });
    }
    return url.toString();
  }

  private async request<T>(method: string, path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const fullUrl = this.buildUrl(path, options?.params);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    let response: Response;
    try {
      response = await fetch(fullUrl, config);
    } catch {
      // Sin conexión, CORS o servidor caído
      throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0, 'NetworkError');
    }

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        let errorType = 'HttpError';
        try {
          const errorData = await response.json();
          if (typeof errorData.message === 'string' && errorData.message.trim()) {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === 'string' && errorData.error.trim()) {
            errorMessage = errorData.error;
          } else if (errorData.error && typeof errorData.error.message === 'string') {
            errorMessage = errorData.error.message;
            if (typeof errorData.error.type === 'string') errorType = errorData.error.type;
          }
        } catch {
          // Response body was not JSON
        }
        throw new ApiError(errorMessage, response.status, errorType);
      }

      // If response has no content (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    
  }

  async get<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(url: string, body: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('POST', url, body, options);
  }

  async put<T>(url: string, body: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('PUT', url, body, options);
  }

  async patch<T>(url: string, body: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('PATCH', url, body, options);
  }

  async delete<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options);
  }
}
