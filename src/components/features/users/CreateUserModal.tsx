import { Component, createSignal, Show } from 'solid-js';
import { UserRole, CreateUserDTO } from '@core/entities/user.entity';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { X, UserPlus, Mail, Lock, User as UserIcon, Shield } from 'lucide-solid';

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateUserDTO) => Promise<void>;
}

export const CreateUserModal: Component<CreateUserModalProps> = (props) => {
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [role, setRole] = createSignal<UserRole>('CUSTOMER');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (!name().trim() || !email().trim() || !password()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsLoading(true);
    try {
      await props.onSubmit({
        name: name().trim(),
        email: email().trim(),
        password: password(),
        role: role(),
      });
      setName('');
      setEmail('');
      setPassword('');
      setRole('CUSTOMER');
      props.onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Show when={props.isOpen}>
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          'background-color': 'rgba(0, 0, 0, 0.85)',
          'backdrop-filter': 'blur(8px)',
          'z-index': '200',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          padding: '20px',
        }}
        onClick={props.onClose}
      >
        <div
          style={{
            'background-color': 'var(--app-dark-100)',
            border: '1px solid var(--border-color)',
            'border-radius': 'var(--radius-lg)',
            width: '100%',
            'max-width': '480px',
            padding: '28px',
            display: 'flex',
            'flex-direction': 'column',
            gap: '20px',
            'box-shadow': 'var(--shadow-lg)',
          }}
          onClick={(e) => e.stopPropagation()}
          class="animate-fade-in"
        >
          <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between' }}>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  'border-radius': 'var(--radius-pill)',
                  'background-color': 'var(--app-green-light)',
                  color: 'var(--app-green)',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                }}
              >
                <UserPlus size={18} />
              </div>
              <h2 style={{ 'font-size': '18px', 'font-weight': '800', color: 'var(--app-white)', margin: '0' }}>
                Nuevo Usuario
              </h2>
            </div>
            <button
              onClick={props.onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--app-gray-500)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <Show when={error()}>
            <div
              style={{
                padding: '10px 14px',
                'background-color': 'var(--app-danger-light)',
                border: '1px solid rgba(225, 25, 0, 0.3)',
                'border-radius': 'var(--radius-md)',
                color: '#ff4d4d',
                'font-size': '13px',
              }}
            >
              {error()}
            </div>
          </Show>

          <form onSubmit={handleSubmit} style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
            <Input
              label="Nombre Completo"
              placeholder="Ej: Carlos Ramírez"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              icon={<UserIcon size={18} />}
              required
            />

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="carlos@delivery.com"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              icon={<Lock size={18} />}
              required
            />

            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '6px' }}>
              <label style={{ 'font-size': '13px', 'font-weight': '600', color: 'var(--app-gray-300)' }}>
                Rol de Usuario
              </label>
              <select
                value={role()}
                onChange={(e) => setRole(e.currentTarget.value as UserRole)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  'background-color': 'var(--app-dark-300)',
                  border: '1px solid var(--border-color)',
                  'border-radius': 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  'font-size': '14px',
                  outline: 'none',
                }}
              >
                <option value="CUSTOMER">Cliente (CUSTOMER)</option>
                <option value="DELIVERY">Repartidor (DELIVERY)</option>
                <option value="RESTAURANT">Restaurante (RESTAURANT)</option>
                <option value="ADMIN">Administrador (ADMIN)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', 'margin-top': '8px' }}>
              <Button variant="outline" fullWidth onClick={props.onClose} type="button">
                Cancelar
              </Button>
              <Button variant="primary" fullWidth isLoading={isLoading()} type="submit">
                Crear Usuario
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
};
