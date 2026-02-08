import { useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '@/services/api';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'PROVIDER' | 'ADMIN';
  providerProfile?: any;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = useMemo(() => ({
    async login(email: string, password: string) {
      const r = await api.login({ email, password });
      setToken(r.token);
      await refresh();
    },
    async register(fullName: string, email: string, password: string, role: 'USER'|'PROVIDER') {
      const r = await api.register({ fullName, email, password, role });
      setToken(r.token);
      await refresh();
    },
    logout() {
      setToken(null);
      setUser(null);
    },
    refresh
  }), []);

  return { user, loading, ...actions };
}
