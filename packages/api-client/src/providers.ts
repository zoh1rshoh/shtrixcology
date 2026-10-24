import type { ApiClient } from './client.js';

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
  requiresConfig: string[];
  available: boolean;
}

export interface ProviderInfo {
  id: string;
  name: string;
  category: 'identity' | 'messaging';
  icon: string;
  configured: boolean;
  status: ProviderStatus;
  capabilities: ProviderCapability[];
  connection: {
    externalId: string | null;
    displayName: string | null;
    linkedAt: string | null;
  };
  missingConfig: string[];
}

export class ProvidersApi {
  constructor(private client: ApiClient) {}

  list(): Promise<{ providers: ProviderInfo[] }> {
    return this.client.get<{ providers: ProviderInfo[] }>('/providers');
  }
}