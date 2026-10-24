import type { TokenStorage } from './storage.js';

export interface ApiClientConfig {
  baseUrl: string;
  storage: TokenStorage;
}

interface SuccessEnvelope<T> {
  ok: true;
  data: T;
}

interface ErrorEnvelope {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

export class ApiClient {
  private baseUrl: string;
  private storage: TokenStorage;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.storage = config.storage;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.storage.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/v1${path}`, {
      ...options,
      headers,
    });

    const json = (await response.json()) as Envelope<T>;

    if (!response.ok || json.ok === false) {
      const err =
        'error' in json
          ? json.error
          : { code: 'UNKNOWN', message: 'Request failed' };
      throw new Error(`[${err.code}] ${err.message}`);
    }

    return json.data;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }
  patch<T>(path: string, body: unknown): Promise<T> {
  return this.request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

delete<T>(path: string): Promise<T> {
  return this.request<T>(path, { method: 'DELETE' });
}

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
