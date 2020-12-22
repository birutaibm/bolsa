import { Ranking } from '@domain/entities';

export interface LastRankingLoader {
  load: () => Promise<Ranking[]>
}
