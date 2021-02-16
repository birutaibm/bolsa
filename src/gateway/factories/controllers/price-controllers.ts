import { Factory } from '@utils/factory';
import {
  ExternalSymbolRegister, ExternalSymbolSearch, LastPriceLoader
} from '@domain/price/usecases';

import {
  LoadLastPriceController,
  ExternalSymbolSearchController,
  ExternalSymbolRegisterController
} from '@gateway/presentation/controllers';
import { ControllerFactory } from '@gateway/factories';

type PriceControllers = {
  readonly price: Factory<LoadLastPriceController>;
  readonly symbolSearch: Factory<ExternalSymbolSearchController>;
  readonly symbolRegister: Factory<ExternalSymbolRegisterController>;
}

type PriceUseCaseFactories = {
  lastPriceLoader: Factory<LastPriceLoader>;
  externalSymbolSearch: Factory<ExternalSymbolSearch>;
  externalSymbolRegister: Factory<ExternalSymbolRegister>;
};

export function createPriceControllers({
  lastPriceLoader,
  externalSymbolSearch,
  externalSymbolRegister,
}: PriceUseCaseFactories): PriceControllers {

  return {
    price: new ControllerFactory(
      () => new LoadLastPriceController(lastPriceLoader.make())
    ),

    symbolSearch: new ControllerFactory(() =>
      new ExternalSymbolSearchController(externalSymbolSearch.make())
    ),

    symbolRegister: new ControllerFactory(() =>
      new ExternalSymbolRegisterController(externalSymbolRegister.make())
    ),
  };
}
