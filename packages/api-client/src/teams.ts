import type {
  CreateTeamRequest,
  JoinTeamRequest,
  Team,
  TeamScoreboardResponse,
} from '@shtrixcology/shared';
import type { ApiClient } from './client.js';

export class TeamsApi {
  constructor(private client: ApiClient) {}

  create(input: CreateTeamRequest) {
    return this.client.post<Team>('/teams', input);
  }

  join(input: JoinTeamRequest) {
    return this.client.post<Team>('/teams/join', input);
  }

  scoreboard(id: string) {
    return this.client.get<TeamScoreboardResponse>(`/teams/${id}`);
  }

  list() {
    return this.client.get<Team[]>('/teams');
  }
}