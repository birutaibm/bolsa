import { ExternalRepository, InternalRepository } from '@data/contracts';
import { ExternalSymbolSearchService, ExternalSymbolRegisterService, LastPriceLoaderService, ExternalPriceRegisterService } from '@data/services';
import { SingletonFactory } from '@domain/utils';

export interface PriceRepositoriesProvider {
  getInternal: () => InternalRepository,
  getExternals: () => ExternalRepository[],
}

export class PriceServiceFactories {
  private externalSymbolSearch: SingletonFactory<ExternalSymbolSearchService[]>;
  private externalSymbolRegister: SingletonFactory<ExternalSymbolRegisterService>;
  private lastPriceLoader: SingletonFactory<LastPriceLoaderService>;

  constructor(
    private readonly repositories: PriceRepositoriesProvider,
  ) {}

  getAll() {
    return {
      externalSymbolSearch: this.ofExternalSymbolSearch(),
      externalSymbolRegister: this.ofExternalSymbolRegister(),
      lastPriceLoader: this.ofLastPriceLoader(),
    };
  }

  ofExternalSymbolSearch(): SingletonFactory<ExternalSymbolSearchService[]> {
    if (!this.externalSymbolSearch) {
      this.externalSymbolSearch = new SingletonFactory(
        () => this.repositories.getExternals()
          .map(repo => new ExternalSymbolSearchService(repo))
      );
    }
    return this.externalSymbolSearch;
  }

  ofExternalSymbolRegister(): SingletonFactory<ExternalSymbolRegisterService> {
    if (!this.externalSymbolRegister) {
      const register = this.repositories.getInternal();
      const repositories = this.repositories.getExternals().reduce(
        (reduced, search) => ({
          ...reduced,
          [search.name]: { search, register },
        }),
        {},
      );
      this.externalSymbolRegister = new SingletonFactory(
        () => new ExternalSymbolRegisterService(repositories)
      );
    }
    return this.externalSymbolRegister;
  }

  ofLastPriceLoader(): SingletonFactory<LastPriceLoaderService> {
    if (!this.lastPriceLoader) {
      const internal = this.repositories.getInternal();
      const externals = this.repositories.getExternals();
      this.lastPriceLoader = new SingletonFactory(
        () => new LastPriceLoaderService(
          internal,
          new ExternalPriceRegisterService(internal, internal, ...externals),
        )
      );
    }
    return this.lastPriceLoader;
  }
}
