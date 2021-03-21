import { Factory } from '@utils/factory';

import {
  InvestorRepository,
  OperationRepository,
  PriceRepositoriesProvider, UserRepository, WalletRepository
} from '@gateway/data/contracts';
import { PositionRepository } from '@gateway/data/contracts/position-repository';

export type RepositoryFactories = {
  disconnectAll(): Promise<void[]>;
  readonly prices: Factory<PriceRepositoriesProvider>;
  readonly users: Factory<UserRepository>;
  readonly investors: Factory<InvestorRepository>;
  readonly wallets: Factory<WalletRepository>;
  readonly positions: Factory<PositionRepository>;
  readonly operations: Factory<OperationRepository>;
}
