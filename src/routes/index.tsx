import { Component, JSX, Show } from 'solid-js';
import { Router, Route, Navigate } from '@solidjs/router';
import { Login } from '@pages/Login';
import { Register } from '@pages/Register';
import { Dashboard } from '@pages/Dashboard';
import { UsersPage } from '@pages/Users';
import { NotFound } from '@pages/NotFound';
import { authStore } from '@state/auth.store';

// Componente Guardia de Rutas Protegidas
const ProtectedRoute: Component<{ children: JSX.Element }> = (props) => {
  return (
    <Show when={authStore.isAuthenticated()} fallback={<Navigate href="/login" />}>
      {props.children}
    </Show>
  );
};

export const AppRoutes: Component = () => {
  return (
    <Router>
      <Route path="/" component={() => <Navigate href="/dashboard" />} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route
        path="/dashboard"
        component={() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/users"
        component={() => (
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        )}
      />
      <Route path="*param" component={NotFound} />
    </Router>
  );
};
