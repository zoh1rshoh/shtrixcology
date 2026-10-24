import {
  createApiClient,
  AuthApi,
  PassportsApi,
  TeamsApi,
  WalletApi,
  ProductsApi,
  ScanApi,
  BattlesApi,
  SettingsApi,
  ProvidersApi
} from '@shtrixcology/api-client';
import { SecureStoreStorage } from './storage';


const storage = new SecureStoreStorage();
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const client = createApiClient({ baseUrl: API_URL, storage });

export const api = {
  auth: new AuthApi(client, storage),
  passports: new PassportsApi(client),
  teams: new TeamsApi(client),
  wallet: new WalletApi(client),
  products: new ProductsApi(client),
  scan: new ScanApi(client),
  battles: new BattlesApi(client),
  providers: new ProvidersApi(client),
  settings: new SettingsApi(client),
};

export { storage };