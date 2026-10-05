export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  setAccessToken(token: string): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  clear(): Promise<void>;
}

// In-memory implementation (test / SSR uchun)
export class MemoryStorage implements TokenStorage {
  private access: string | null = null;
  private refresh: string | null = null;

  async getAccessToken() { return this.access; }
  async setAccessToken(t: string) { this.access = t; }
  async getRefreshToken() { return this.refresh; }
  async setRefreshToken(t: string) { this.refresh = t; }
  async clear() { this.access = null; this.refresh = null; }
}