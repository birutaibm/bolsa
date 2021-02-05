import { SingletonFactory } from '@utils/factory';
import { LoadLastRankingRepository } from '@gateway/data/contracts';
import { RankingDTO } from '@gateway/data/dto';
import {
  LastRankingLoader,
  RequiredFunctionalities
} from '@domain/ranking/usecases/last-ranking-loader';

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
