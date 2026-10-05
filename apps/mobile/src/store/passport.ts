import { create } from 'zustand';
import type { Passport } from '@shtrixcology/shared';
import { api } from '../lib/api';

interface PassportState {
  passports: Passport[];
  loading: boolean;
  load: () => Promise<void>;
  add: (p: Passport) => void;
}

export const usePassports = create<PassportState>((set) => ({
  passports: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const res = await api.passports.list();
      set({ passports: res.passports });
    } finally { set({ loading: false }); }
  },
  add: (p) => set((s) => ({ passports: [p, ...s.passports] })),
}));