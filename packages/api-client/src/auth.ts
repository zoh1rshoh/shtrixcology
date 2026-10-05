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

  private async persist(res: AuthResponse) {
    await this.storage.setAccessToken(res.accessToken);
    await this.storage.setRefreshToken(res.refreshToken);
  }
}