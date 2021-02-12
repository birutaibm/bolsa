import { Factory } from '@utils/factory';

import {
  LoadLastRankingRepository,
  PriceRepositoriesProvider, UserRepository
} from '@gateway/data/contracts';

export type RepositoryFactories = {
  readonly prices: Factory<PriceRepositoriesProvider>;
  readonly user: Factory<UserRepository>;
  readonly ranking: Factory<LoadLastRankingRepository>;
}
