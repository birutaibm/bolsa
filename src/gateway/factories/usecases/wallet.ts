import { SingletonFactory } from '@utils/factory';

import {
  InvestorLoader, InvestorCreator, WalletLoader, WalletCreator,
  PositionLoader, PositionCreator, OperationLoader, OperationCreator,
} from '@domain/wallet/usecases';

import {
  InvestorRepository, OperationRepository, WalletRepository, PositionRepository,
  InternalPriceRepository,
} from '@gateway/data/contracts';
import WalletDependencies from '@gateway/data/adapters/wallet-dependencies';

export default function createWalletUseCasesFactories(
  investors: InvestorRepository,
  wallets: WalletRepository,
  positions: PositionRepository,
  operations: OperationRepository,
  assets: InternalPriceRepository,
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
    new WalletCreator(async (walletName, investorId) =>
        (await wallets.saveNewWallet(walletName, investorId)).id,
      investorLoader.make(),
    ),
  );

  const positionLoader = new SingletonFactory(
    () => new PositionLoader((id, loggedUserId) => adapter.positionLoader(id, loggedUserId)),
  );
  const positionCreator = new SingletonFactory(
    () => new PositionCreator(async (assetId, walletId) =>
        (await positions.saveNewPosition(assetId, walletId)).id,
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
      async (date, quantity, value, positionId) =>
        (await operations.saveNewOperation({date, quantity, value, positionId}))
          .id,
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
