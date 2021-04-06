import { SingletonFactory } from '@utils/factory';

import {
  InvestorLoader, InvestorCreator, WalletLoader, WalletCreator,
  PositionLoader, PositionCreator, OperationLoader, OperationCreator,
} from '@domain/wallet/usecases';

import {
  InvestorRepository, OperationRepository, WalletRepository, PositionRepository,
  InternalPriceRepository,
  RepositoryChangeCommandExecutors,
} from '@gateway/data/contracts';
import WalletDependencies from '@gateway/data/adapters/wallet-dependencies';
import walletModuleSavers from '@gateway/data/adapters/wallet-module-savers';

export default function createWalletUseCasesFactories(
  investors: InvestorRepository,
  wallets: WalletRepository,
  positions: PositionRepository,
  operations: OperationRepository,
  assets: InternalPriceRepository,
  changers: RepositoryChangeCommandExecutors<any>,
) {
  const adapter = new WalletDependencies(
    investors, wallets, positions, operations
  );
  const savers = walletModuleSavers(
    changers, investors, wallets, positions, operations
  );

  const investorLoader = new SingletonFactory(
    () => new InvestorLoader(
      (id) => adapter.investorLoader(id)
    ),
  );
  const investorCreator = new SingletonFactory(
    () => new InvestorCreator(savers.newInvestor),
  );

  const walletLoader = new SingletonFactory(
    () => new WalletLoader(
      (id, isLogged) => adapter.walletLoader(id, isLogged)
    ),
  );
  const walletCreator = new SingletonFactory(() =>
    new WalletCreator(savers.newWallet),
  );

  const positionLoader = new SingletonFactory(
    () => new PositionLoader((id, isLogged) => adapter.positionLoader(id, isLogged)),
  );
  const positionCreator = new SingletonFactory(
    () => new PositionCreator(savers.newPosition),
  );

  const operationLoader = new SingletonFactory(
    () => new OperationLoader(
      (id, isLogged) => adapter.operationLoader(id, isLogged)
    ),
  );
  const operationCreator = new SingletonFactory(
    () => new OperationCreator(savers.newOperation),
  );

  return {
    investorLoader,
    investorCreator,
    walletLoader,
    walletCreator,
    positionLoader,
    positionCreator,
    operationLoader,
    operationCreator,
  };
}
