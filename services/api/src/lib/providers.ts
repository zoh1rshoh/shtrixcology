import { env } from '../env.js';

// ===========================================
// PROVIDER STATUS
// ===========================================
export type ProviderStatus =
  | 'not_configured'
  | 'connected'
  | 'not_connected'
  | 'reauthorization_required'
  | 'capability_unavailable'
  | 'temporarily_unavailable';

export interface ProviderCapability {
  id: string;
  label: string;
  description: string;
  requiresConfig: string[]; // env var nomlari
}

export interface ProviderConfig {
  id: string;
  name: string;
  category: 'identity' | 'messaging';
  icon: string;
  configured: boolean;
  capabilities: ProviderCapability[];
  missingConfig: string[];
}

// ===========================================
// PROVIDER DEFINITIONS
// ===========================================
const PROVIDERS: Array<{
  id: string;
  name: string;
  category: 'identity' | 'messaging';
  icon: string;
  requiredEnv: string[];
  capabilities: ProviderCapability[];
}> = [
  {
    id: 'google',
    name: 'Google',
    category: 'identity',
    icon: 'logo-google',
    requiredEnv: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    capabilities: [
      {
        id: 'signin',
        label: 'Google orqali kirish',
        description: 'Google akkaunt bilan tizimga kirish',
        requiresConfig: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      },
    ],
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'identity',
    icon: 'logo-apple',
    requiredEnv: ['APPLE_CLIENT_ID', 'APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_PRIVATE_KEY'],
    capabilities: [
      {
        id: 'signin',
        label: 'Apple orqali kirish',
        description: 'Apple ID bilan tizimga kirish',
        requiresConfig: ['APPLE_CLIENT_ID', 'APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_PRIVATE_KEY'],
      },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'identity',
    icon: 'logo-facebook',
    requiredEnv: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
    capabilities: [
      {
        id: 'signin',
        label: 'Facebook orqali kirish',
        description: 'Facebook akkaunt bilan tizimga kirish',
        requiresConfig: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
      },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'messaging',
    icon: 'paper-plane',
    requiredEnv: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_USERNAME'],
    capabilities: [
      {
        id: 'notifications',
        label: 'Telegram bildirishnomalar',
        description: 'Telegram orqali xabar olish',
        requiresConfig: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_USERNAME'],
      },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'messaging',
    icon: 'logo-instagram',
    requiredEnv: ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET'],
    capabilities: [
      {
        id: 'direct',
        label: 'Instagram Direct',
        description: 'Instagram orqali xabar (Meta tasdiqlashni talab qiladi)',
        requiresConfig: ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET', 'INSTAGRAM_APPROVED'],
      },
    ],
  },
  {
    id: 'messenger',
    name: 'Facebook Messenger',
    category: 'messaging',
    icon: 'chatbubble',
    requiredEnv: ['FACEBOOK_PAGE_TOKEN', 'FACEBOOK_APP_SECRET'],
    capabilities: [
      {
        id: 'direct',
        label: 'Messenger Direct',
        description: 'Messenger orqali xabar (Meta tasdiqlashni talab qiladi)',
        requiresConfig: ['FACEBOOK_PAGE_TOKEN', 'FACEBOOK_APP_SECRET', 'MESSENGER_APPROVED'],
      },
    ],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    category: 'messaging',
    icon: 'logo-twitter',
    requiredEnv: ['X_CLIENT_ID', 'X_CLIENT_SECRET'],
    capabilities: [
      {
        id: 'dm',
        label: 'X Direct Messages',
        description: 'X orqali xabar (API access talab qilinadi)',
        requiresConfig: ['X_CLIENT_ID', 'X_CLIENT_SECRET', 'X_DM_ENABLED'],
      },
    ],
  },
];

// ===========================================
// GET PROVIDER CONFIGS
// ===========================================
export function getProviderConfigs(): ProviderConfig[] {
  const envVars = env as Record<string, unknown>;

  return PROVIDERS.map((p) => {
    const missingConfig = p.requiredEnv.filter((key) => {
      const value = envVars[key];
      return !value || typeof value !== 'string' || value.length === 0;
    });

    // Extra capability-level config (e.g., *_APPROVED)
    const allMissing = [...missingConfig];
    p.capabilities.forEach((cap) => {
      cap.requiresConfig.forEach((key) => {
        const value = envVars[key];
        if (!value && !allMissing.includes(key)) {
          allMissing.push(key);
        }
      });
    });

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      icon: p.icon,
      configured: allMissing.length === 0,
      capabilities: p.capabilities,
      missingConfig: allMissing,
    };
  });
}

export function isProviderConfigured(providerId: string): boolean {
  const config = getProviderConfigs().find((p) => p.id === providerId);
  return config?.configured ?? false;
}

export function getMissingConfig(providerId: string): string[] {
  const config = getProviderConfigs().find((p) => p.id === providerId);
  return config?.missingConfig ?? [];
}