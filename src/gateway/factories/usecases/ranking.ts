import { SingletonFactory } from '@utils/factory';
import { LastRankingLoader } from '@domain/ranking/usecases';
import { LoadLastRankingRepository } from '@gateway/data/contracts';

export default class RankingUseCasesFactories {
  private loader: SingletonFactory<LastRankingLoader>;

  constructor(
    private readonly repository: LoadLastRankingRepository,
  ) {}

  getAll() {
    return {
      loader: this.ofLastRankingLoader(),
    };
  }

  ofLastRankingLoader(): SingletonFactory<LastRankingLoader> {
    if (!this.loader) {
      this.loader = new SingletonFactory(
        () => new LastRankingLoader(this.repository)
      );
    }
    return this.loader;
  }
}
