import { Factory } from '@utils/factory';

import {
  PriceRepositoriesProvider, UserRepository, WalletRepository
} from '@gateway/data/contracts';

export type RepositoryFactories = {
  readonly prices: Factory<PriceRepositoriesProvider>;
  readonly users: Factory<UserRepository>;
  readonly wallets: Factory<WalletRepository>;
}
