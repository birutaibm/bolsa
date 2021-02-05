import { Ranking } from '@domain/entities';
import { RankingUnavailableError } from '@domain/errors';

export interface RequiredFunctionalities {
  load(): Promise<Ranking[]>;
}

export class LastRankingLoader {
  constructor(
    private readonly worker: RequiredFunctionalities,
  ) {}

  load(): Promise<Ranking[]> {
    if (new Date().getHours() > 21) {
      throw new RankingUnavailableError();
    }
    return this.worker.load();
  }
}
