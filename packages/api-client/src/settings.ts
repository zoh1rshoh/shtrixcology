import type { ApiClient } from './client.js';

export interface UserSettings {
  userId: string;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;

  pushEnabled: boolean;
  emailEnabled: boolean;
  passportUpdates: boolean;
  rewardNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;

  theme: 'light' | 'dark' | 'system';
  language: 'uz' | 'ru' | 'en';
  reduceMotion: boolean;

  profileVisibility: 'public' | 'friends' | 'private';
  showInRankings: boolean;
  showLocation: boolean;
  allowInvites: boolean;

  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;

  battleNotifications: boolean;
  autoAcceptInvites: boolean;
  matchmakingRegion: string | null;
  preferredBattleType: string | null;
  showInBattleRanking: boolean;

  connectedGoogle: boolean;
  connectedTelegram: boolean;
  connectedApple: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface UsernameCheckResult {
  available: boolean;
  reason: string | null;
}

export interface ExportRequestResult {
  requestId: string;
  status: string;
  estimatedReadyAt: string;
  message: string;
}

export interface SupportReportResult {
  ticketId: string;
  status: string;
  message: string;
}

export class SettingsApi {
  constructor(private client: ApiClient) {}

  get(): Promise<{ settings: UserSettings }> {
    return this.client.get<{ settings: UserSettings }>('/settings');
  }

  update(input: Partial<UserSettings>): Promise<{ settings: UserSettings }> {
    return this.client.patch<{ settings: UserSettings }>('/settings', input);
  }

  reset(): Promise<{ settings: UserSettings }> {
    return this.client.post<{ settings: UserSettings }>('/settings/reset', {});
  }

  deleteAccount(): Promise<{ deleted: boolean }> {
    return this.client.delete<{ deleted: boolean }>('/settings/account');
  }

  checkUsername(username: string): Promise<UsernameCheckResult> {
    return this.client.get<UsernameCheckResult>(
      `/settings/check-username/${username}`
    );
  }

  requestExport(): Promise<ExportRequestResult> {
    return this.client.post<ExportRequestResult>(
      '/settings/export-request',
      {}
    );
  }

  submitReport(input: {
    category: string;
    subject: string;
    description: string;
    referenceId?: string;
  }): Promise<SupportReportResult> {
    return this.client.post<SupportReportResult>(
      '/settings/support/report',
      input
    );
  }
}