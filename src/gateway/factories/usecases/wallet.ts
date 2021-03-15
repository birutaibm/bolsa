import { SingletonFactory } from '@utils/factory';

import {
  InvestorLoader, InvestorCreator, WalletLoader, WalletCreator,
  PositionLoader, PositionCreator, OperationLoader, OperationCreator,
} from '@domain/wallet/usecases';

import {
  InvestorRepository, OperationRepository, WalletRepository, PositionRepository, InternalRepository
} from '@gateway/data/contracts';
import WalletDependencies from '@gateway/data/adapters/wallet-dependencies';

export default function createWalletUseCasesFactories(
  investors: InvestorRepository,
  wallets: WalletRepository,
  positions: PositionRepository,
  operations: OperationRepository,
  assets: InternalRepository,
) {
  const adapter = new WalletDependencies(
    investors, wallets, positions, operations
  );

  const investorLoader = new SingletonFactory(
    () => new InvestorLoader(
      (id) => adapter.investorLoader(id)
    ),
  );
  const investorCreator = new SingletonFactory(
    () => new InvestorCreator((investor) =>
      investors.saveNewInvestor(investor)
    ),
  );

  const walletLoader = new SingletonFactory(
    () => new WalletLoader(
      (id, loggedUserId) => adapter.walletLoader(id, loggedUserId)
    ),
  );
  const walletCreator = new SingletonFactory(() =>
    new WalletCreator((walletName, investorId, loggedUserId) =>
        adapter.walletCreator(walletName, investorId, loggedUserId),
      investorLoader.make(),
    ),
  );

  const positionLoader = new SingletonFactory(
    () => new PositionLoader((id, loggedUserId) => adapter.positionLoader(id, loggedUserId)),
  );
  const positionCreator = new SingletonFactory(
    () => new PositionCreator((assetId, walletId, loggedUserId) =>
        adapter.positionCreator(assetId, walletId, loggedUserId),
      walletLoader.make(),
      assets,
    ),
  );

  const operationLoader = new SingletonFactory(
    () => new OperationLoader(
      (id, loggedUserId) => adapter.operationLoader(id, loggedUserId)
    ),
  );
  const operationCreator = new SingletonFactory(
    () => new OperationCreator(
      (date, quantity, value, positionId, loggedUserId) =>
        adapter.operationCreator(date, quantity, value, positionId, loggedUserId),
      positionLoader.make()
    ),
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
