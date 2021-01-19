import { ExternalRepository, InternalRepository } from '@data/contracts';
import { ExternalSymbolSearchService, ExternalSymbolRegisterService, LastPriceLoaderService, ExternalPriceRegisterService } from '@data/services';
import { SingletonFactory } from '@domain/utils';

export interface PriceRepositoriesProvider {
  getInternal: () => InternalRepository,
  getExternals: () => ExternalRepository[],
}

export class PriceServiceFactories {
  constructor(
    private readonly repositories: PriceRepositoriesProvider,
  ) {}

  ofExternalSymbolSearch(): SingletonFactory<ExternalSymbolSearchService> {
    return new SingletonFactory(
      () => new ExternalSymbolSearchService(this.repositories.getExternals()[0])
    );
  }

  ofExternalSymbolRegister(): SingletonFactory<ExternalSymbolRegisterService> {
    const repositories = {
      [this.repositories.getExternals()[0].name]: {
        search: this.repositories.getExternals()[0],
        register: this.repositories.getInternal(),
      },
    }
    return new SingletonFactory(
      () => new ExternalSymbolRegisterService(repositories)
    );
  }

  ofLastPriceLoader(): SingletonFactory<LastPriceLoaderService> {
    const internal = this.repositories.getInternal();
    const externals = this.repositories.getExternals();
    return new SingletonFactory(
      () => new LastPriceLoaderService(
        internal,
        new ExternalPriceRegisterService(internal, internal, ...externals),
      )
    );
  }
}
