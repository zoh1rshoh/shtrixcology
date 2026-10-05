import { Platform } from 'react-native';
import type { TokenStorage } from '@shtrixcology/api-client';

const ACCESS_KEY = 'shtrixcology_access';
const REFRESH_KEY = 'shtrixcology_refresh';

// ===========================================
// Web: localStorage
// ===========================================
const webStorage: TokenStorage = {
  async getAccessToken() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  async setAccessToken(token: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_KEY, token);
  },
  async getRefreshToken() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  async setRefreshToken(token: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(REFRESH_KEY, token);
  },
  async clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

// ===========================================
// Native: SecureStore (lazy import)
// ===========================================
const nativeStorage: TokenStorage = {
  async getAccessToken() {
    const SecureStore = require('expo-secure-store');
    return SecureStore.getItemAsync(ACCESS_KEY);
  },
  async setAccessToken(token: string) {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync(ACCESS_KEY, token);
  },
  async getRefreshToken() {
    const SecureStore = require('expo-secure-store');
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async setRefreshToken(token: string) {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync(REFRESH_KEY, token);
  },
  async clear() {
    const SecureStore = require('expo-secure-store');
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

// ===========================================
// Export — platformaga qarab tanlaydi
// ===========================================
export class SecureStoreStorage implements TokenStorage {
  private impl = Platform.OS === 'web' ? webStorage : nativeStorage;

  getAccessToken() { return this.impl.getAccessToken(); }
  setAccessToken(token: string) { return this.impl.setAccessToken(token); }
  getRefreshToken() { return this.impl.getRefreshToken(); }
  setRefreshToken(token: string) { return this.impl.setRefreshToken(token); }
  clear() { return this.impl.clear(); }
}