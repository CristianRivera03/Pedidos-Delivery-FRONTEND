import { Component, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '@state/auth.store';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-solid';

export const LoginForm: Component = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [validationError, setValidationError] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setValidationError('');

    if (!email().trim()) {
      setValidationError('Ingresa tu correo electrónico');
      return;
    }
    if (!password()) {
      setValidationError('Ingresa tu contraseña');
      return;
    }

    const success = await authStore.login({
      email: email().trim(),
      password: password(),
    });

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '20px',
        width: '100%',
      }}
    >
      <Show when={validationError() || authStore.error()}>
        <div
          style={{
            padding: '12px 16px',
            'background-color': 'var(--app-danger-light)',
            border: '1px solid rgba(225, 25, 0, 0.3)',
            'border-radius': 'var(--radius-md)',
            color: '#ff4d4d',
            'font-size': '13px',
            display: 'flex',
            'align-items': 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} />
          <span>{validationError() || authStore.error()}</span>
        </div>
      </Show>

      <Input
        label="Correo Electrónico"
        type="email"
        placeholder="ejemplo@delivery.com"
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={authStore.isLoading()}
        icon={<ArrowRight size={18} />}
      >
        Continuar
      </Button>
    </form>
  );
};
