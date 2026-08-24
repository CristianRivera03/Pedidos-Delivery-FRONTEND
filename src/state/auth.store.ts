import { createSignal, createMemo } from 'solid-js';
import { User } from '@core/entities/user.entity';
import { LoginCredentials, RegisterCredentials } from '@core/entities/auth.entity';
import { authService } from '@infrastructure/services';

const TOKEN_KEY = 'delivery_token';
const USER_KEY = 'delivery_user';

// Recuperar sesión guardada
const initialToken = localStorage.getItem(TOKEN_KEY) || null;
const storedUser = localStorage.getItem(USER_KEY);
const initialUser: User | null = storedUser ? JSON.parse(storedUser) : null;

// Reactividad con Señales
const [user, setUser] = createSignal<User | null>(initialUser);
const [token, setToken] = createSignal<string | null>(initialToken);
const [isLoading, setIsLoading] = createSignal<boolean>(false);
const [error, setError] = createSignal<string | null>(null);

// Memos computados (caché reactiva)
const isAuthenticated = createMemo(() => !!token() && !!user());
const userRole = createMemo(() => user()?.role || null);

export const authStore = {
  // Getters reactivos
  user,
  token,
  isLoading,
  error,
  isAuthenticated,
  userRole,

  // Métodos de acción
  login: async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
      setIsLoading(false);
      return false;
    }
  },
  
  register: async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(credentials);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(msg);
      setIsLoading(false);
      return false;
    }
  },

  fetchProfile: async (): Promise<User | null> => {
    const currentToken = token();
    if (!currentToken) return null;
    try {
      const currentUser = await authService.getCurrentUser(currentToken);
      setUser(currentUser);
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      return currentUser;
    } catch {
      authStore.logout();
      return null;
    }
  },

  logout: () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  clearError: () => setError(null),
};

// Sincronizar / validar perfil del usuario al cargar la app si existe token
if (initialToken) {
  authStore.fetchProfile();
}
