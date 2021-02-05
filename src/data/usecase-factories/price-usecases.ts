import {
  ExternalSymbolRepositories,
  PriceRepositoriesProvider
} from '@data/contracts';

import { ExternalPriceRegisterFactory } from './external-price-register';
import { ExternalSymbolRegisterFactory } from './external-symbol-register';
import { ExternalSymbolSearchFactory } from './external-symbol-search';
import { LastPriceLoaderFactory } from './last-price-loader';

export class PriceUseCasesFactories {
  private externalSymbolSearch: ExternalSymbolSearchFactory;
  private externalSymbolRegister: ExternalSymbolRegisterFactory;
  private lastPriceLoader: LastPriceLoaderFactory;

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

  ofExternalSymbolSearch(): ExternalSymbolSearchFactory {
    if (!this.externalSymbolSearch) {
      this.externalSymbolSearch = new ExternalSymbolSearchFactory(
        ...this.repositories.getExternals()
      );
    }
    return this.externalSymbolSearch;
  }

  ofExternalSymbolRegister(): ExternalSymbolRegisterFactory {
    if (!this.externalSymbolRegister) {
      const register = this.repositories.getInternal();
      const repositories: ExternalSymbolRepositories =
        this.repositories.getExternals().reduce(
          (reduced, search) => ({
            ...reduced,
            [search.name]: { search, register },
          }),
          {},
        );
      this.externalSymbolRegister = new ExternalSymbolRegisterFactory(
        repositories
      );
    }
    return this.externalSymbolRegister;
  }

  ofLastPriceLoader(): LastPriceLoaderFactory {
    if (!this.lastPriceLoader) {
      const internal = this.repositories.getInternal();
      const externals = this.repositories.getExternals();
      this.lastPriceLoader = new LastPriceLoaderFactory(
        internal,
        new ExternalPriceRegisterFactory(internal, internal, ...externals),
      );
    }
    return this.lastPriceLoader;
  }
}
