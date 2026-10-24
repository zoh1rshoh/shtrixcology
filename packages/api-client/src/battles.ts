import type { ApiClient } from './client.js';

export interface Battle {
  id: string;
  title: string;
  type: string;
  goal: string;
  durationDays: number;
  entry: string;
  status: string;
  rewards: any[];
  participants: string[];
  creatorUserId: string;
  creatorTeamId: string | null;
  createdAt: string;
}

export class BattlesApi {
  constructor(private client: ApiClient) {}

  create(input: {
    title: string;
    type: string;
    goal: string;
    durationDays: number;
    entry: string;
    rewards?: any[];
    participants?: string[];
  }): Promise<{ battle: Battle }> {
    return this.client.post<{ battle: Battle }>('/battles', input);
  }

  list(filter: string): Promise<{ battles: Battle[] }> {
    return this.client.get<{ battles: Battle[] }>(`/battles?filter=${filter}`);
  }

  join(id: string): Promise<{ battle: Battle }> {
    return this.client.post<{ battle: Battle }>(`/battles/${id}/join`, {});
  }
}