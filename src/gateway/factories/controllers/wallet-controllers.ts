import { Authorization } from '@domain/user/usecases';
import CreateOperation from '@domain/wallet/usecases/create-operation';
import { Factory } from '@utils/factory';

import {
  OperationRegisterController
} from '@gateway/presentation/controllers';
import { ControllerFactory } from '@gateway/factories';

type WalletControllers = {
  readonly operationRegister: Factory<OperationRegisterController>;
}

type WalletUseCaseFactories = {
  creator: Factory<CreateOperation>;
};

export function createWalletControllers(
  { creator }: WalletUseCaseFactories, authorization: Factory<Authorization>
): WalletControllers {

  return {
    operationRegister: new ControllerFactory(
      () => new OperationRegisterController(
        creator.make(),
        authorization.make()
      )
    ),
  };
}
