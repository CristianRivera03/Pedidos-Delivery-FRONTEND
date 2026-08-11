import { Component, JSX, splitProps, Show } from 'solid-js';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: JSX.Element;
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'variant',
    'size',
    'isLoading',
    'fullWidth',
    'icon',
    'children',
    'class',
    'disabled',
  ]);

  const variant = () => local.variant || 'primary';
  const size = () => local.size || 'md';

  const baseStyles: JSX.CSSProperties = {
    display: 'inline-flex',
    'align-items': 'center',
    'justify-content': 'center',
    gap: '8px',
    'font-weight': '600',
    'font-family': 'var(--font-family)',
    'border-radius': 'var(--radius-pill)',
    border: 'none',
    cursor: local.disabled || local.isLoading ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-fast)',
    opacity: local.disabled ? '0.6' : '1',
    width: local.fullWidth ? '100%' : 'auto',
    'text-decoration': 'none',
    outline: 'none',
  };

  const getVariantStyles = (): JSX.CSSProperties => {
    switch (variant()) {
      case 'primary':
        return {
          'background-color': 'var(--app-green)',
          color: '#000000',
          'box-shadow': 'var(--shadow-green)',
        };
      case 'secondary':
        return {
          'background-color': 'var(--app-white)',
          color: '#000000',
        };
      case 'outline':
        return {
          'background-color': 'transparent',
          color: 'var(--app-white)',
          border: '1px solid var(--border-color)',
        };
      case 'danger':
        return {
          'background-color': 'var(--app-danger)',
          color: '#ffffff',
        };
      case 'ghost':
        return {
          'background-color': 'transparent',
          color: 'var(--app-gray-300)',
        };
    }
  };

  const getSizeStyles = (): JSX.CSSProperties => {
    switch (size()) {
      case 'sm':
        return { padding: '8px 16px', 'font-size': '13px' };
      case 'md':
        return { padding: '12px 24px', 'font-size': '14px' };
      case 'lg':
        return { padding: '16px 32px', 'font-size': '16px' };
    }
  };

  return (
    <button
      {...rest}
      disabled={local.disabled || local.isLoading}
      style={{
        ...baseStyles,
        ...getVariantStyles(),
        ...getSizeStyles(),
      }}
      class={`app-btn ${local.class || ''}`}
    >
      <Show when={local.isLoading}>
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(0,0,0,0.2)',
            'border-top-color': variant() === 'primary' ? '#000' : '#fff',
            'border-radius': '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      </Show>
      <Show when={!local.isLoading && local.icon}>
        <span>{local.icon}</span>
      </Show>
      <span>{local.children}</span>
    </button>
  );
};
