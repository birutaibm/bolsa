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
      (id, isLogged) => adapter.walletLoader(id, isLogged)
    ),
  );
  const walletCreator = new SingletonFactory(() =>
    new WalletCreator({
        async newWalletOfInvestor(walletName, investorId) {
          return (await wallets.saveNewWallet(walletName, investorId)).id;
        },
        async newWalletAndInvestor(name, investor, user) {
          const { id, ownerId } = await wallets.saveNewWalletAndInvestor(
            name, investor, user
          );
          return { walletId: id, investorId: ownerId };
        }
      },
      investorLoader.make(),
    ),
  );

  const positionLoader = new SingletonFactory(
    () => new PositionLoader((id, isLogged) => adapter.positionLoader(id, isLogged)),
  );
  const positionCreator = new SingletonFactory(
    () => new PositionCreator(async (assetId, walletId) =>
        (await positions.saveNewPosition(assetId, walletId)).id,
      assets,
      walletLoader.make(),
      walletCreator.make(),
    ),
  );

  const operationLoader = new SingletonFactory(
    () => new OperationLoader(
      (id, isLogged) => adapter.operationLoader(id, isLogged)
    ),
  );
  const operationCreator = new SingletonFactory(
    () => new OperationCreator(
      async (date, quantity, value, positionId) =>
        (await operations.saveNewOperation({date, quantity, value, positionId}))
          .id,
      positionLoader.make(),
      positionCreator.make(),
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
