import { Component, createSignal, onMount, For } from 'solid-js';
import { MainLayout } from '@components/layout/MainLayout';
import { authStore } from '@state/auth.store';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { ShoppingBag, Users, TrendingUp, Shield, ArrowUpRight, Clock } from 'lucide-solid';
import { A } from '@solidjs/router';

export const Dashboard: Component = () => {
  const metrics = [
    { title: 'Pedidos Hoy', value: '148', change: '+12%', icon: ShoppingBag, color: 'var(--app-green)' },
    { title: 'Usuarios', value: '1,240', change: '+8%', icon: Users, color: '#276EF1' },
    { title: 'Entregas en Camino', value: '32', change: 'En tiempo', icon: TrendingUp, color: '#FFB703' },
    { title: 'Tiempo Promedio', value: '24 min', change: '-3 min', icon: Clock, color: '#E11900' },
  ];

  return (
    <MainLayout>
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '32px' }}>
        {/* Welcome Header */}
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between' }}>
          <div>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
              <h1 style={{ 'font-size': '28px', 'font-weight': '800', color: 'var(--app-white)', margin: '0' }}>
                ¡Hola, {authStore.user()?.name || 'Usuario'}!
              </h1>
              <Badge role={authStore.user()?.role} />
            </div>
            <p style={{ color: 'var(--text-secondary)', 'font-size': '14px', 'margin-top': '4px' }}>
              Bienvenido al centro de mando de App Delivery con reactividad en tiempo real.
            </p>
          </div>

          <A href="/users" style={{ 'text-decoration': 'none' }}>
            <Button variant="primary" icon={<ArrowUpRight size={16} />}>
              Gestionar Usuarios
            </Button>
          </A>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <For each={metrics}>
            {(metric) => {
              const IconComp = metric.icon;
              return (
                <div
                  style={{
                    'background-color': 'var(--app-dark-100)',
                    border: '1px solid var(--border-color)',
                    'border-radius': 'var(--radius-lg)',
                    padding: '20px',
                    display: 'flex',
                    'flex-direction': 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', 'font-size': '13px', 'font-weight': '600' }}>
                      {metric.title}
                    </span>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        'border-radius': 'var(--radius-pill)',
                        'background-color': `${metric.color}1c`,
                        color: metric.color,
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                      }}
                    >
                      <IconComp size={18} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', 'align-items': 'baseline', gap: '10px' }}>
                    <span style={{ 'font-size': '28px', 'font-weight': '800', color: 'var(--app-white)' }}>
                      {metric.value}
                    </span>
                    <span style={{ 'font-size': '12px', color: 'var(--app-green)', 'font-weight': '600' }}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </MainLayout>
  );
};
