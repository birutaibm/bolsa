import { Factory, SingletonFactory } from '@utils/factory';

import { Authorization } from '@domain/user/usecases';
import {
  InvestorLoader, InvestorCreator, WalletLoader, WalletCreator,
  PositionLoader, PositionCreator, OperationLoader, OperationCreator
} from '@domain/wallet/usecases';

import { ControllerFactory } from '@gateway/factories';
import {
  InvestorLoaderController, InvestorCreatorController,
  WalletLoaderController, WalletCreatorController,
  PositionLoaderController, PositionCreatorController,
  OperationLoaderController, OperationCreatorController
} from '@gateway/presentation/controllers';

type WalletControllers = {
  investorLoader: ControllerFactory<InvestorLoaderController>;
  investorCreator: ControllerFactory<InvestorCreatorController>;
  walletLoader: ControllerFactory<WalletLoaderController>;
  walletCreator: ControllerFactory<WalletCreatorController>;
  positionLoader: ControllerFactory<PositionLoaderController>;
  positionCreator: ControllerFactory<PositionCreatorController>;
  operationLoader: ControllerFactory<OperationLoaderController>;
  operationCreator: ControllerFactory<OperationCreatorController>;
}

type WalletUseCaseFactories = {
  investorLoader: Factory<InvestorLoader>;
  investorCreator: Factory<InvestorCreator>;
  walletLoader: Factory<WalletLoader>;
  walletCreator: Factory<WalletCreator>;
  positionLoader: Factory<PositionLoader>;
  positionCreator: Factory<PositionCreator>;
  operationLoader: Factory<OperationLoader>;
  operationCreator: Factory<OperationCreator>;
};

export function createWalletControllers(
  useCases: WalletUseCaseFactories, authorization: Factory<Authorization>
): WalletControllers {

  return {
    investorLoader: new SingletonFactory(
      () => new InvestorLoaderController(
        useCases.investorLoader.make(), authorization.make(),
      ),
    ),

    investorCreator: new SingletonFactory(
      () => new InvestorCreatorController(
        useCases.investorCreator.make(), authorization.make(),
      ),
    ),

    walletLoader: new SingletonFactory(
      () => new WalletLoaderController(
        useCases.walletLoader.make(), authorization.make(),
      ),
    ),

    walletCreator: new SingletonFactory(
      () => new WalletCreatorController(
        useCases.walletCreator.make(), authorization.make(),
      ),
    ),

    positionLoader: new SingletonFactory(
      () => new PositionLoaderController(
        useCases.positionLoader.make(), authorization.make(),
      ),
    ),

    positionCreator: new SingletonFactory(
      () => new PositionCreatorController(
        useCases.positionCreator.make(), authorization.make(),
      ),
    ),

    operationLoader: new SingletonFactory(
      () => new OperationLoaderController(
        useCases.operationLoader.make(), authorization.make(),
      ),
    ),

    operationCreator: new SingletonFactory(
      () => new OperationCreatorController(
        useCases.operationCreator.make(), authorization.make(),
      ),
    ),
  };
}
