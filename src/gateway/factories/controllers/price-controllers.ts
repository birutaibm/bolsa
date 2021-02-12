import { Factory } from '@utils/factory';

import { PriceRepositoriesProvider } from '@gateway/data/contracts';
import {
  LoadLastPriceController,
  ExternalSymbolSearchController,
  ExternalSymbolRegisterController
} from '@gateway/presentation/controllers';
import { PriceUseCasesFactories, ControllerFactory } from '@gateway/factories';

type PriceControllers = {
  readonly price: Factory<LoadLastPriceController>;
  readonly symbolSearch: Factory<ExternalSymbolSearchController>;
  readonly symbolRegister: Factory<ExternalSymbolRegisterController>;
}

export function createPriceControllers(
  repositoryFactory: Factory<PriceRepositoriesProvider>,
): PriceControllers {
  const repositories = repositoryFactory.make();
  const priceServiceFactories = new PriceUseCasesFactories(repositories);
  const {
    lastPriceLoader,
    externalSymbolSearch,
    externalSymbolRegister,
  } = priceServiceFactories.getAll();

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
