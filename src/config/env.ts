export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://pedidos-delivery-backend.onrender.com/api/v1',
  APP_NAME: 'App Delivery',
} as const;
