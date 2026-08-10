import { create } from 'zustand';
import api from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  initialize: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('diya_token');
    if (!token) return;

    set({ token, loading: true });
    try {
      const profile = await api.get<any>('/auth/profile');
      set({ user: profile, loading: false });
    } catch (e: any) {
      localStorage.removeItem('diya_token');
      set({ token: null, user: null, error: e.message, loading: false });
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<any>('/auth/login', credentials);
      localStorage.setItem('diya_token', res.token);
      set({ token: res.token, user: res.user, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem('diya_token');
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
