import { LoadLastRankingRepository } from '@data/contracts';
import { RankingDTO } from '@data/dto';

import { ranking } from '@infra/data-source/in-memory';

export class FakeRankingRepository implements LoadLastRankingRepository {
  async loadLastRanking(): Promise<RankingDTO[]> {
    return ranking.map(item => ({
      player: item.user,
      heroes: item.heroes,
      score: item.score,
      matchDate: new Date(item.date)
    }));
  }
}
