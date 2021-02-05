import { RankingDTO } from '@gateway/data/dto';

export interface LoadLastRankingRepository {
  loadLastRanking: () => Promise<RankingDTO[]>
}
