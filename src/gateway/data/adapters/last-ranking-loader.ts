import { LoadLastRankingRepository } from '@gateway/data/contracts';
import { RankingDTO } from '@gateway/data/dto';
import {
  RequiredFunctionalities
} from '@domain/ranking/usecases/last-ranking-loader';

export class LastRankingLoaderFunctionalities implements RequiredFunctionalities {
  constructor(
    private readonly loadLastRankingRepository: LoadLastRankingRepository,
  ) {}

  load(): Promise<RankingDTO[]> {
    return this.loadLastRankingRepository.loadLastRanking();
  }
}
