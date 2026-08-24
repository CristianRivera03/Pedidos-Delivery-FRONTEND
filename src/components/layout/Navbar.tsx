import { Component, Show } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { authStore } from '@state/auth.store';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { LogOut, User as UserIcon, ShoppingBag, Users, LayoutDashboard } from 'lucide-solid';

export const Navbar: Component = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        'background-color': 'var(--app-black)',
        'border-bottom': '1px solid var(--border-color)',
        position: 'sticky',
        top: '0',
        'z-index': '100',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
      }}
    >
      {/* Brand Logo */}
      <div style={{ display: 'flex', 'align-items': 'center', gap: '32px' }}>
        <A
          href="/dashboard"
          style={{
            'text-decoration': 'none',
            display: 'flex',
            'align-items': 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              'background-color': 'var(--app-green)',
              'border-radius': 'var(--radius-sm)',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: '#000',
              'font-weight': '900',
              'font-size': '18px',
            }}
          >
            D
          </div>
          <span style={{ 'font-size': '20px', 'font-weight': '800', color: '#fff', 'letter-spacing': '-0.5px' }}>
            App <span style={{ color: 'var(--app-green)' }}>Delivery</span>
          </span>
        </A>

        {/* Navigation Links */}
        <Show when={authStore.isAuthenticated()}>
          <nav style={{ display: 'flex', gap: '8px' }}>
            <A
              href="/dashboard"
              style={{
                display: 'flex',
                'align-items': 'center',
                gap: '8px',
                padding: '8px 16px',
                color: 'var(--text-secondary)',
                'text-decoration': 'none',
                'font-size': '14px',
                'font-weight': '500',
                'border-radius': 'var(--radius-pill)',
                transition: 'var(--transition-fast)',
              }}
              activeClass="navbar-link-active"
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </A>
            <Show when={authStore.userRole() === 'ADMIN'}>
              <A
              href="/users"
              style={{
                display: 'flex',
                'align-items': 'center',
                gap: '8px',
                padding: '8px 16px',
                color: 'var(--text-secondary)',
                'text-decoration': 'none',
                'font-size': '14px',
                'font-weight': '500',
                'border-radius': 'var(--radius-pill)',
                transition: 'var(--transition-fast)',
              }}
              activeClass="navbar-link-active"
            >
              <Users size={16} />
              <span>Usuarios</span>
            </A>
            </Show>
          </nav>
        </Show>
      </div>

      {/* User Actions */}
      <Show
        when={authStore.isAuthenticated()}
        fallback={
          <A href="/login" style={{ 'text-decoration': 'none' }}>
            <Button variant="primary" size="sm">
              Iniciar Sesión
            </Button>
          </A>
        }
      >
        <div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              'align-items': 'center',
              gap: '12px',
              padding: '6px 14px',
              'background-color': 'var(--app-dark-200)',
              'border-radius': 'var(--radius-pill)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                'border-radius': '50%',
                'background-color': 'var(--app-dark-400)',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                color: 'var(--app-white)',
              }}
            >
              <UserIcon size={14} />
            </div>
            <div style={{ display: 'flex', 'flex-direction': 'column' }}>
              <span style={{ 'font-size': '13px', 'font-weight': '600', color: 'var(--app-white)' }}>
                {authStore.user()?.name}
              </span>
              <span style={{ 'font-size': '11px', color: 'var(--text-muted)' }}>
                {authStore.user()?.email}
              </span>
            </div>
            <Badge role={authStore.user()?.role} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={<LogOut size={16} />}
            title="Cerrar Sesión"
          >
            Salir
          </Button>
        </div>
      </Show>
    </header>
  );
};
