import { Component, Show } from 'solid-js';
import { User } from '@core/entities/user.entity';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Mail, Calendar, Trash2, Shield, CheckCircle, XCircle } from 'lucide-solid';

export interface UserCardProps {
  user: User;
  onDelete?: (id: string) => void;
}

export const UserCard: Component<UserCardProps> = (props) => {
  const formattedDate = () => {
    if (!props.user.createdAt) return 'Fecha no registrada';
    return new Date(props.user.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      style={{
        'background-color': 'var(--app-dark-100)',
        border: '1px solid var(--border-color)',
        'border-radius': 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        'flex-direction': 'column',
        gap: '16px',
        transition: 'var(--transition-smooth)',
        position: 'relative',
        overflow: 'hidden',
      }}
      class="user-card-hover"
    >
      <div style={{ display: 'flex', 'align-items': 'flex-start', 'justify-content': 'space-between' }}>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              'border-radius': '50%',
              'background-color': 'var(--app-dark-300)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'var(--app-green)',
              'font-weight': '700',
              'font-size': '18px',
            }}
          >
            {props.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ 'font-size': '16px', 'font-weight': '700', color: 'var(--app-white)', margin: '0' }}>
              {props.user.name}
            </h3>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '6px', 'margin-top': '2px', color: 'var(--text-muted)', 'font-size': '13px' }}>
              <Mail size={14} />
              <span>{props.user.email}</span>
            </div>
          </div>
        </div>

        <Badge role={props.user.role} />
      </div>

      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          'padding-top': '12px',
          'border-top': '1px solid rgba(255, 255, 255, 0.06)',
          'font-size': '12px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', 'align-items': 'center', gap: '6px' }}>
          <Calendar size={14} />
          <span>Registrado: {formattedDate()}</span>
        </div>

        <div style={{ display: 'flex', 'align-items': 'center', gap: '6px' }}>
          <Show when={props.user.isActive} fallback={<Badge variant="danger">Inactivo</Badge>}>
            <span style={{ color: 'var(--app-green)', display: 'flex', 'align-items': 'center', gap: '4px' }}>
              <CheckCircle size={14} /> Activo
            </span>
          </Show>
        </div>
      </div>

      <Show when={props.onDelete}>
        <div style={{ display: 'flex', 'justify-content': 'flex-end', 'margin-top': '4px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.onDelete?.(props.user.id)}
            icon={<Trash2 size={14} />}
            style={{ color: 'var(--app-danger)' }}
          >
            Eliminar
          </Button>
        </div>
      </Show>
    </div>
  );
};
