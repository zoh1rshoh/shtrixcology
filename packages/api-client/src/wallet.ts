import type { WalletBalanceResponse } from '@shtrixcology/shared';
import type { ApiClient } from './client.js';

export class WalletApi {
  constructor(private client: ApiClient) {}

  balance() {
    return this.client.get<WalletBalanceResponse>('/wallet');
  }
}