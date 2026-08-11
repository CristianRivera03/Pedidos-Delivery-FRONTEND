import { Component, JSX, splitProps } from 'solid-js';
import { UserRole } from '@core/entities/user.entity';

export interface BadgeProps {
  role?: UserRole;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  children?: JSX.Element;
}

export const Badge: Component<BadgeProps> = (props) => {
  const [local] = splitProps(props, ['role', 'variant', 'children']);

  const getConfig = () => {
    if (local.role) {
      switch (local.role) {
        case 'ADMIN':
          return { bg: 'rgba(255, 183, 3, 0.15)', color: '#FFB703', label: 'ADMINISTRADOR' };
        case 'DELIVERY':
          return { bg: 'rgba(39, 110, 241, 0.15)', color: '#276EF1', label: 'REPARTIDOR' };
        case 'RESTAURANT':
          return { bg: 'rgba(6, 193, 103, 0.15)', color: '#06C167', label: 'RESTAURANTE' };
        case 'CUSTOMER':
        default:
          return { bg: 'rgba(255, 255, 255, 0.1)', color: '#D1D1D1', label: 'CLIENTE' };
      }
    }

    switch (local.variant) {
      case 'success':
        return { bg: 'rgba(6, 193, 103, 0.15)', color: '#06C167', label: '' };
      case 'warning':
        return { bg: 'rgba(255, 183, 3, 0.15)', color: '#FFB703', label: '' };
      case 'danger':
        return { bg: 'rgba(225, 25, 0, 0.15)', color: '#E11900', label: '' };
      case 'info':
        return { bg: 'rgba(39, 110, 241, 0.15)', color: '#276EF1', label: '' };
      case 'neutral':
      default:
        return { bg: 'rgba(255, 255, 255, 0.1)', color: '#D1D1D1', label: '' };
    }
  };

  const config = () => getConfig();

  return (
    <span
      style={{
        display: 'inline-flex',
        'align-items': 'center',
        padding: '4px 10px',
        'border-radius': 'var(--radius-pill)',
        'font-size': '11px',
        'font-weight': '700',
        'letter-spacing': '0.5px',
        'text-transform': 'uppercase',
        'background-color': config().bg,
        color: config().color,
        border: `1px solid ${config().color}33`,
      }}
    >
      {local.children || config().label}
    </span>
  );
};
