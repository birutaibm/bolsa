import {
  ExternalSymbolSearch,
  ExternalSymbolRegister,
  LastPriceLoader,
  ExternalPriceRegister,
} from '@domain/price/usecases';
import {
  ExternalSymbolRepositoryProvider,
  priceLoaderOf,
  PriceRepositoriesIntegrator,
  SearchExternalSymbolRepositories,
} from '@gateway/data/adapters';
import { PriceRepositoriesProvider } from '@gateway/data/contracts';
import { SingletonFactory } from '@utils/factory';

export default function createPriceUseCasesFactories(
  { internal, externals }: PriceRepositoriesProvider,
) {
  const externalSymbolSearch = new SingletonFactory(
    () => new ExternalSymbolSearch(
      new SearchExternalSymbolRepositories(
        externals
      )
    )
  );
  const externalSymbolRegister = new SingletonFactory(
    () => new ExternalSymbolRegister(
      new ExternalSymbolRepositoryProvider(
        internal,
        externals,
      )
    )
  );
  const externalPriceRegister = new SingletonFactory(
    () => new ExternalPriceRegister(
      new PriceRepositoriesIntegrator(internal, internal, ...externals)
    )
  );
  const lastPriceLoader = new SingletonFactory(
    () => new LastPriceLoader(
      priceLoaderOf(
        internal,
        externalPriceRegister.make(),
      )
    )
  );

  return {
    externalSymbolSearch,
    externalSymbolRegister,
    lastPriceLoader,
  };
}
