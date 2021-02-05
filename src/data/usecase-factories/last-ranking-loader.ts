import { SingletonFactory } from '@domain/utils';
import { LoadLastRankingRepository } from '@data/contracts';
import { RankingDTO } from '@data/dto';
import {
  LastRankingLoader,
  RequiredFunctionalities
} from '@domain/usecases/last-ranking-loader';

class Functionality implements RequiredFunctionalities {
  constructor(
    private readonly loadLastRankingRepository: LoadLastRankingRepository,
  ) {}

  load(): Promise<RankingDTO[]> {
    return this.loadLastRankingRepository.loadLastRanking();
  }
}

export class LastRankingLoaderFactory extends SingletonFactory<LastRankingLoader> {
  constructor(
    loadLastRankingRepository: LoadLastRankingRepository,
  ) {
    super(
      () => new LastRankingLoader(
        new Functionality(loadLastRankingRepository)
      )
    );
  }
}
