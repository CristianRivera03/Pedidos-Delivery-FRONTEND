import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { Button } from '@components/ui/Button';
import { Home } from 'lucide-solid';

export const NotFound: Component = () => {
  return (
    <div
      style={{
        'min-height': '100vh',
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        'background-color': 'var(--app-black)',
        padding: '20px',
        'text-align': 'center',
      }}
    >
      <h1 style={{ 'font-size': '80px', 'font-weight': '900', color: 'var(--app-green)', margin: '0' }}>
        404
      </h1>
      <h2 style={{ 'font-size': '24px', color: 'var(--app-white)', 'margin-top': '12px' }}>
        Página no encontrada
      </h2>
      <p style={{ color: 'var(--text-secondary)', 'margin-top': '8px', 'margin-bottom': '24px' }}>
        La ruta que intentas acceder no existe en el sistema.
      </p>
      <A href="/dashboard" style={{ 'text-decoration': 'none' }}>
        <Button variant="primary" icon={<Home size={16} />}>
          Volver al Inicio
        </Button>
      </A>
    </div>
  );
};
