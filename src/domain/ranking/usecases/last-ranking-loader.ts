import { Ranking } from '@domain/ranking/entities';
import { RankingUnavailableError } from '@errors/ranking-unavailable';

export interface RequiredFunctionalities {
  loadLastRanking(): Promise<Ranking[]>;
}

export class LastRankingLoader {
  constructor(
    private readonly worker: RequiredFunctionalities,
  ) {}

  async load(): Promise<Ranking[]> {
    if (new Date().getHours() > 21) {
      throw new RankingUnavailableError();
    }
    return this.worker.loadLastRanking();
  }
}
