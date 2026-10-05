import type { Theme } from './theme.js';

export interface ThemedProps {
  theme?: Theme;
}

export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';