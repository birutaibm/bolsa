import { SingletonFactory } from '@utils/factory';
import { LoadLastRankingRepository } from '@gateway/data/contracts';
import {
  LastRankingLoaderFunctionalities as Functionalities
} from '@gateway/data/adapters';
import {
  LastRankingLoader,
} from '@domain/ranking/usecases/last-ranking-loader';

export class LastRankingLoaderFactory extends SingletonFactory<LastRankingLoader> {
  constructor(
    loadLastRankingRepository: LoadLastRankingRepository,
  ) {
    super(
      () => new LastRankingLoader(
        new Functionalities(loadLastRankingRepository)
      )
    );
  }
}
