import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  RefreshRequest,
} from '@shtrixcology/shared';
import type { ApiClient } from './client.js';
import type { TokenStorage } from './storage.js';

export class AuthApi {
  constructor(
    private client: ApiClient,
    private storage: TokenStorage
  ) {}

  async signup(input: SignupRequest): Promise<AuthResponse> {
    const res = await this.client.post<AuthResponse>('/auth/signup', input);
    await this.persist(res);
    return res;
  }

  async login(input: LoginRequest): Promise<AuthResponse> {
    const res = await this.client.post<AuthResponse>('/auth/login', input);
    await this.persist(res);
    return res;
  }

  async refresh(): Promise<AuthResponse> {
    const refreshToken = await this.storage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const res = await this.client.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    } as RefreshRequest);
    await this.persist(res);
    return res;
  }

  async logout(): Promise<void> {
    await this.storage.clear();
  }

  // ============================================
  // YANGI METODLAR (Parolni tiklash uchun)
  // ============================================
  async forgotPassword(phone: string): Promise<{ message: string; devCode?: string }> {
    return this.client.post<{ message: string; devCode?: string }>(
      '/auth/forgot-password',
      { phone }
    );
  }

  async resetPassword(phone: string, code: string, newPassword: string): Promise<{ message: string }> {
    return this.client.post<{ message: string }>(
      '/auth/reset-password',
      { phone, code, newPassword }
    );
  }

  private async persist(res: AuthResponse) {
    await this.storage.setAccessToken(res.accessToken);
    await this.storage.setRefreshToken(res.refreshToken);
  }
}