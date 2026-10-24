import type { ApiClient } from './client.js';

export interface TeamListItem {
  id: string;
  name: string;
  type: string;
  city: string;
  weeklyScore: number;
  memberCount: number;
  rank: number;
}

export interface MyTeam {
  id: string;
  name: string;
  type: string;
  city: string;
  weeklyScore: number;
  memberCount: number;
  rank: number;
  myRole: string;
  myContribution: number;
  topMembers: Array<{
    id: string;
    fullName: string;
    weeklyContribution: number;
  }>;
}

export class TeamsApi {
  constructor(private client: ApiClient) {}

  list(): Promise<{ teams: TeamListItem[] }> {
    return this.client.get<{ teams: TeamListItem[] }>('/teams');
  }

  me(): Promise<{ team: MyTeam | null }> {
    return this.client.get<{ team: MyTeam | null }>('/teams/me');
  }

  create(input: {
    name: string;
    type: string;
    city: string;
  }): Promise<{ team: { id: string; name: string } }> {
    return this.client.post<{ team: { id: string; name: string } }>(
      '/teams',
      input
    );
  }

  join(teamId: string): Promise<{ team: { id: string; name: string } }> {
    return this.client.post<{ team: { id: string; name: string } }>(
      '/teams/join',
      { teamId }
    );
  }

  leave(): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>('/teams/leave', {});
  }
}