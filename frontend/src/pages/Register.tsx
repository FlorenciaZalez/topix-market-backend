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

  return 'No pudimos crear la cuenta';
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await register(fullName, email, password);
      navigate('/');
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  return (
    <div className="topix-page flex justify-center">
      <GlassCard className="mx-auto w-full max-w-xl p-8 sm:p-10">
        <p className="topix-kicker">Crear cuenta</p>
        <h2 className="mt-4 text-3xl font-semibold text-ink">Un paso simple para comprar mejor.</h2>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nombre completo"
            className="topix-input"
          />
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
          <button className="topix-button w-full">Crear cuenta</button>
        </form>

        <div className="mt-4">
          <Link to="/login" className="topix-button-secondary w-full">
            Ya tengo cuenta
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
