import { Component, JSX, splitProps, Show } from 'solid-js';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: JSX.Element;
  helperText?: string;
}

export const Input: Component<InputProps> = (props) => {
  const [local, rest] = splitProps(props, ['label', 'error', 'icon', 'helperText', 'class', 'id']);

  const inputId = () => local.id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', gap: '6px', width: '100%' }}>
      <Show when={local.label}>
        <label
          for={inputId()}
          style={{
            'font-size': '13px',
            'font-weight': '600',
            color: 'var(--app-gray-300)',
            'letter-spacing': '0.3px',
          }}
        >
          {local.label}
        </label>
      </Show>

      <div style={{ position: 'relative', width: '100%' }}>
        <Show when={local.icon}>
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--app-gray-500)',
              display: 'flex',
              'align-items': 'center',
            }}
          >
            {local.icon}
          </div>
        </Show>

        <input
          id={inputId()}
          {...rest}
          style={{
            width: '100%',
            padding: local.icon ? '12px 14px 12px 42px' : '12px 14px',
            'background-color': 'var(--app-dark-300)',
            border: local.error ? '1px solid var(--app-danger)' : '1px solid var(--border-color)',
            'border-radius': 'var(--radius-md)',
            color: 'var(--text-primary)',
            'font-size': '14px',
            'font-family': 'var(--font-family)',
            outline: 'none',
            transition: 'var(--transition-fast)',
          }}
          class={`app-input ${local.class || ''}`}
        />
      </div>

      <Show when={local.error}>
        <span style={{ 'font-size': '12px', color: 'var(--app-danger)', 'margin-top': '2px' }}>
          {local.error}
        </span>
      </Show>
      <Show when={!local.error && local.helperText}>
        <span style={{ 'font-size': '12px', color: 'var(--text-muted)', 'margin-top': '2px' }}>
          {local.helperText}
        </span>
      </Show>
    </div>
  );
};
