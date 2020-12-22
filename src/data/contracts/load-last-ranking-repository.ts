import { RankingDTO } from '@data/dto';

export interface LoadLastRankingRepository {
  loadLastRanking: () => Promise<RankingDTO[]>
}
