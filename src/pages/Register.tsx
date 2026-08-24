import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { RegisterForm } from '@components/features/auth/RegisterForm';
import { Sparkles } from 'lucide-solid';
import { Button } from '@components/ui/Button';

export const Register: Component = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        'min-height': '100vh',
        display: 'flex',
        'background-color': 'var(--app-black)',
      }}
    >
      <div
        style={{
          flex: '1',
          padding: '60px',
          display: 'flex',
          'flex-direction': 'column',
          'justify-content': 'space-between',
          'background-color': 'var(--app-dark-100)',
          'border-right': '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden',
        }}
        class="login-hero-desktop"
      >
        <div style={{ position: 'relative', 'z-index': '2' }}>
          <div
            style={{
              display: 'inline-flex',
              'align-items': 'center',
              gap: '8px',
              padding: '6px 16px',
              'background-color': 'var(--app-green-light)',
              color: 'var(--app-green)',
              'border-radius': 'var(--radius-pill)',
              'font-size': '12px',
              'font-weight': '700',
              'letter-spacing': '0.5px',
              'margin-bottom': '24px',
            }}
          >
            <Sparkles size={14} />
            <span>SISTEMA ENTERPRISE DELIVERY</span>
          </div>
          <h1
            style={{
              'font-size': '44px',
              'font-weight': '900',
              color: 'var(--app-white)',
              'line-height': '1.1',
              'margin-bottom': '16px',
              'letter-spacing': '-1px',
            }}
          >
            Crea tu cuenta y <br />
            <span style={{ color: 'var(--app-green)' }}>empieza a gestionar</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', 'font-size': '16px', 'max-width': '460px' }}>
            Registra tus datos para acceder a la plataforma de logística y gestión de pedidos.
          </p>
        </div>

        <div style={{ color: 'var(--text-muted)', 'font-size': '12px', 'z-index': '2' }}>
          App Delivery &copy; {new Date().getFullYear()}
        </div>
      </div>

      <div
        style={{
          width: '520px',
          display: 'flex',
          'flex-direction': 'column',
          'justify-content': 'center',
          'align-items': 'center',
          padding: '40px',
          'overflow-y': 'auto',
        }}
      >
        <div style={{ width: '100%', 'max-width': '380px' }}>
          <div style={{ 'margin-bottom': '24px' }}>
            <h2 style={{ 'font-size': '28px', 'font-weight': '800', color: 'var(--app-white)', 'margin-bottom': '8px' }}>
              Crear Cuenta
            </h2>
            <p style={{ color: 'var(--text-secondary)', 'font-size': '14px' }}>
              Completa tus datos para registrarte como cliente.
            </p>
          </div>

          <RegisterForm />

          <div style={{ 'margin-top': '20px', 'text-align': 'center' }}>
            <span style={{ color: 'var(--text-secondary)', 'font-size': '13px' }}>¿Ya tienes una cuenta? </span>
            <Button variant="ghost" size="sm" type="button" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
