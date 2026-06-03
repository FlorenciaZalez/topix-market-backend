import { isAxiosError } from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { GlassCard } from 'components/GlassCard';
import { useAuth } from 'context/AuthContext';

function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'No se pudo conectar con el servidor. Revisa la URL del backend y la configuracion CORS.';
    }

    if (error.message) {
      return error.message;
    }
  }

  return 'Credenciales invalidas';
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  return (
    <div className="topix-page flex justify-center">
      <GlassCard className="mx-auto w-full max-w-xl p-8 sm:p-10">
        <p className="topix-kicker">Login</p>
        <h2 className="mt-4 text-3xl font-semibold text-ink">Bienvenida de nuevo.</h2>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="topix-input"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="topix-input"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="topix-button w-full">Ingresar</button>
        </form>

        <div className="mt-4">
          <Link to="/register" className="topix-button-secondary w-full">
            Crear cuenta
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
