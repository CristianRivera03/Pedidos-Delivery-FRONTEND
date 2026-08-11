import { Component } from 'solid-js';
import { LoginForm } from '@components/features/auth/LoginForm';
import { ShieldCheck, Truck, Clock, Sparkles } from 'lucide-solid';

export const Login: Component = () => {
  return (
    <div
      style={{
        'min-height': '100vh',
        display: 'flex',
        'background-color': 'var(--app-black)',
      }}
    >
      {/* Left Column - Hero Branding */}
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
            Entregas rápidas con <br />
            <span style={{ color: 'var(--app-green)' }}>Máxima Eficiencia</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', 'font-size': '16px', 'max-width': '460px' }}>
            Plataforma de logística y gestión de pedidos delivery optimizada en tiempo real.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', 'grid-template-columns': 'repeat(2, 1fr)', gap: '16px', 'z-index': '2' }}>
          <div
            style={{
              padding: '20px',
              'background-color': 'var(--app-dark-200)',
              'border-radius': 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Truck size={24} color="var(--app-green)" />
            <h4 style={{ color: 'var(--app-white)', 'margin-top': '12px', 'font-weight': '700' }}>
              Rastreo Realtime
            </h4>
            <p style={{ color: 'var(--text-muted)', 'font-size': '13px', 'margin-top': '4px' }}>
              Actualización instantánea de estados y repartos.
            </p>
          </div>

          <div
            style={{
              padding: '20px',
              'background-color': 'var(--app-dark-200)',
              'border-radius': 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <ShieldCheck size={24} color="#276EF1" />
            <h4 style={{ color: 'var(--app-white)', 'margin-top': '12px', 'font-weight': '700' }}>
              Seguridad JWT
            </h4>
            <p style={{ color: 'var(--text-muted)', 'font-size': '13px', 'margin-top': '4px' }}>
              Autenticación segura basada en tokens y roles.
            </p>
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', 'font-size': '12px', 'z-index': '2' }}>
          App Delivery &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Right Column - Login Box */}
      <div
        style={{
          width: '520px',
          display: 'flex',
          'flex-direction': 'column',
          'justify-content': 'center',
          'align-items': 'center',
          padding: '40px',
        }}
      >
        <div style={{ width: '100%', 'max-width': '380px' }}>
          <div style={{ 'margin-bottom': '32px' }}>
            <h2 style={{ 'font-size': '28px', 'font-weight': '800', color: 'var(--app-white)', 'margin-bottom': '8px' }}>
              Iniciar Sesión
            </h2>
            <p style={{ color: 'var(--text-secondary)', 'font-size': '14px' }}>
              Ingresa tus credenciales para acceder al panel.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
};
