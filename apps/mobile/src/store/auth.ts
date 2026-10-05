import { create } from 'zustand';
import type { User } from '@shtrixcology/shared';
import { api, storage } from '../lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  login: (phone: string, password: string) => Promise<void>;
  signup: (
    phone: string,
    fullName: string,
    password: string,
    email?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,

  setUser: (user) => set({ user }),

  login: async (phone, password) => {
    set({ loading: true });
    try {
      const res = await api.auth.login({ phone, password });
      set({ user: res.user });
    } finally {
      set({ loading: false });
    }
  },

  signup: async (phone, fullName, password, email) => {
    set({ loading: true });
    try {
      const res = await api.auth.signup({
        phone,
        fullName,
        password,
        ...(email ? { email } : {}),
      });
      set({ user: res.user });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    await storage.clear();
    set({ user: null });
  },

  refreshUser: async () => {
    try {
      const res = await api.auth.refresh();
      set({ user: res.user });
    } catch {
      await storage.clear();
      set({ user: null });
    }
  },
}));