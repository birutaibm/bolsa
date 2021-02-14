import { LoadLastRankingRepository } from '@gateway/data/contracts';
import { RankingDTO } from '@gateway/data/dto';

export class FakeRankingRepository implements LoadLastRankingRepository {
  private readonly ranking = [{
    user: {
      country: 'Brazil',
      name: 'Rafael Arantes',
    },
    heroes: [{
      name: 'Fee',
      level: 30,
    }, {
      name: 'Connie',
      level: 23,
    }, {
      name: 'Mabyn',
      level: 27,
    }],
    date: 1578625200000,
    score: 455,
  }];

  async loadLastRanking(): Promise<RankingDTO[]> {
    return this.ranking.map(item => ({
      player: item.user,
      heroes: item.heroes,
      score: item.score,
      matchDate: new Date(item.date)
    }));
  }
}
