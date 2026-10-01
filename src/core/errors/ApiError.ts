// RNF-08 (cliente): error tipado a partir del Envelope Pattern del backend
// { success: false, statusCode, error: { type, message }, timestamp, path }

export type ApiErrorKind = 'domain' | 'security' | 'infrastructure' | 'network';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly type: string;

  constructor(message: string, statusCode: number, type = 'UnknownError') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.type = type;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** Clasificación según el tipo de error del backend */
  get kind(): ApiErrorKind {
    if (this.statusCode === 0) return 'network';
    if (this.statusCode === 401 || this.statusCode === 403) return 'security';
    if (this.statusCode >= 500) return 'infrastructure';
    return 'domain'; // 400, 404, 409...
  }
}