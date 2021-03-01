import { Factory } from '@utils/factory';

import {
  PriceRepositoriesProvider, UserRepository
} from '@gateway/data/contracts';

export type RepositoryFactories = {
  readonly prices: Factory<PriceRepositoriesProvider>;
  readonly users: Factory<UserRepository>;
}
