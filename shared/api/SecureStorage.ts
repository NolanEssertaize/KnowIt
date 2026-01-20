/**
 * @file SecureStorage.ts
 * @description Token storage with fallback
 * 
 * Uses expo-secure-store when available (production builds)
 * Falls back to AsyncStorage for Expo Go / development
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Token } from './types';

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'knowit_access_token',
  REFRESH_TOKEN: 'knowit_refresh_token',
  USER: 'knowit_user',
} as const;

/**
 * Check if SecureStore is available
 */
async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    await SecureStore.setItemAsync('__test__', 'test');
    await SecureStore.deleteItemAsync('__test__');
    return true;
  } catch {
    return false;
  }
}

// Cache the availability check
let useSecureStore: boolean | null = null;

async function shouldUseSecureStore(): Promise<boolean> {
  if (useSecureStore === null) {
    useSecureStore = await isSecureStoreAvailable();
    console.log(`[SecureTokenManager] Using ${useSecureStore ? 'SecureStore' : 'AsyncStorage'}`);
  }
  return useSecureStore;
}

/**
 * Secure Token Manager
 * Automatically falls back to AsyncStorage if SecureStore unavailable
 */
export const SecureTokenManager = {
  /**
   * Get item from storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (await shouldUseSecureStore()) {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`[SecureTokenManager] Failed to get ${key}:`, error);
      return null;
    }
  },

  /**
   * Set item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (await shouldUseSecureStore()) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`[SecureTokenManager] Failed to set ${key}:`, error);
      // Don't throw - storage failure shouldn't break auth flow
    }
  },

  /**
   * Delete item from storage
   */
  async deleteItem(key: string): Promise<void> {
    try {
      if (await shouldUseSecureStore()) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`[SecureTokenManager] Failed to delete ${key}:`, error);
    }
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Store tokens
   */
  async setTokens(tokens: Token): Promise<void> {
    await Promise.all([
      this.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token),
      this.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token),
    ]);
    console.log('[SecureTokenManager] Tokens stored');
  },

  /**
   * Clear all tokens
   */
  async clearTokens(): Promise<void> {
    await Promise.all([
      this.deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
      this.deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
      this.deleteItem(STORAGE_KEYS.USER),
    ]);
    console.log('[SecureTokenManager] Tokens cleared');
  },

  /**
   * Store user data
   */
  async setUser(user: unknown): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Get cached user
   */
  async getUser<T>(): Promise<T | null> {
    const data = await this.getItem(STORAGE_KEYS.USER);
    if (data) {
      try {
        return JSON.parse(data) as T;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if tokens exist
   */
  async hasTokens(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  },
};
