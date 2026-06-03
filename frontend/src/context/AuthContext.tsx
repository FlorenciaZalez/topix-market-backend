import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCurrentUser, loginUser, registerUser } from 'api/shop';
import type { AuthResponse, User } from 'types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('topix-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        localStorage.removeItem('topix-token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
  }, [token]);

  async function login(email: string, password: string) {
    const response: AuthResponse = await loginUser({ email, password });
    localStorage.setItem('topix-token', response.access_token);
    setToken(response.access_token);
    setUser(response.user);
  }

  async function register(fullName: string, email: string, password: string) {
    await registerUser({ full_name: fullName, email, password });
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem('topix-token');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
