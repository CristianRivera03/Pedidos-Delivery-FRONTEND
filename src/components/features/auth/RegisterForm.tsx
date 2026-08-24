import { Component, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '@state/auth.store';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { User, Mail, Phone, Lock, AlertCircle, ArrowRight } from 'lucide-solid';

export const RegisterForm: Component = () => {
  const navigate = useNavigate();
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [phone, setPhone] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [validationError, setValidationError] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setValidationError('');

    if (!name().trim()) {
      setValidationError('Ingresa tu nombre completo');
      return;
    }
    if (!email().trim()) {
      setValidationError('Ingresa tu correo electrónico');
      return;
    }
    if (!/^\+?[0-9]{7,15}$/.test(phone().trim())) {
      setValidationError('Ingresa un teléfono válido (7 a 15 dígitos)');
      return;
    }
    if (password().length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password() !== confirmPassword()) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    const success = await authStore.register({
      name: name().trim(),
      email: email().trim(),
      phone: phone().trim(),
      password: password(),
    });

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', 'flex-direction': 'column', gap: '16px', width: '100%' }}
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
        label="Nombre Completo"
        type="text"
        placeholder="Ej: Carlos Ramírez"
        value={name()}
        onInput={(e) => setName(e.currentTarget.value)}
        icon={<User size={18} />}
        required
      />

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
        label="Teléfono"
        type="tel"
        placeholder="Ej: 70123456"
        value={phone()}
        onInput={(e) => setPhone(e.currentTarget.value)}
        icon={<Phone size={18} />}
        required
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
        icon={<Lock size={18} />}
        required
        minLength={8}
      />

      <Input
        label="Confirmar Contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        value={confirmPassword()}
        onInput={(e) => setConfirmPassword(e.currentTarget.value)}
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
        Crear Cuenta
      </Button>
    </form>
  );
};
