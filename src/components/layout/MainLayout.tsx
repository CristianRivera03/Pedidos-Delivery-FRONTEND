import { Component, JSX } from 'solid-js';
import { Navbar } from './Navbar';

export interface MainLayoutProps {
  children: JSX.Element;
}

export const MainLayout: Component<MainLayoutProps> = (props) => {
  return (
    <div style={{ 'min-height': '100vh', display: 'flex', 'flex-direction': 'column' }}>
      <Navbar />
      <main
        class="animate-fade-in"
        style={{
          flex: '1',
          padding: '32px 24px',
          'max-width': '1280px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {props.children}
      </main>

      <footer
        style={{
          border: '1px solid var(--border-color)',
          padding: '24px',
          'text-align': 'center',
          'font-size': '13px',
          color: 'var(--text-muted)',
          'background-color': 'var(--app-black)',
          'margin-top': 'auto',
        }}
      >
        App Delivery System &copy; {new Date().getFullYear()} — Plataforma de Gestión de Pedidos
      </footer>
    </div>
  );
};
