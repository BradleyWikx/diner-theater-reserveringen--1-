import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppConfig } from '../types/types';
import { defaultConfig } from '../config/config';

interface ConfigState {
  config: AppConfig;
  isLoading: boolean;
  error: string | null;
  setConfig: (config: AppConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useConfigStore = create<ConfigState>()(
  devtools(
    (set) => ({
      config: defaultConfig,
      isLoading: false,
      error: null,
      setConfig: (config) => set({ config }, false, 'setConfig'),
      setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),
    }),
    {
      name: 'config-store',
    }
  )
);
