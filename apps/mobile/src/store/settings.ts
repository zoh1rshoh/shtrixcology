import { create } from 'zustand';
import { api } from '../lib/api';
import type { UserSettings } from '@shtrixcology/api-client';

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  saving: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<UserSettings>) => Promise<void>;
  reset: () => Promise<void>;
  // Optimistic updates
  set: (patch: Partial<UserSettings>) => void;
}

export const useSettings = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  saving: false,

  load: async () => {
    set({ loading: true });
    try {
      const res = await api.settings.get();
      set({ settings: res.settings });
    } catch (e) {
      console.log('Settings load error:', e);
    } finally {
      set({ loading: false });
    }
  },

  update: async (patch) => {
    const prev = get().settings;
    // Optimistic
    if (prev) set({ settings: { ...prev, ...patch } });
    set({ saving: true });
    try {
      const res = await api.settings.update(patch);
      set({ settings: res.settings });
    } catch (e) {
      // Rollback on error
      if (prev) set({ settings: prev });
      throw e;
    } finally {
      set({ saving: false });
    }
  },

  reset: async () => {
    set({ saving: true });
    try {
      const res = await api.settings.reset();
      set({ settings: res.settings });
    } finally {
      set({ saving: false });
    }
  },

  set: (patch) => {
    const prev = get().settings;
    if (prev) set({ settings: { ...prev, ...patch } });
  },
}));