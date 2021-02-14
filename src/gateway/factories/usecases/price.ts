import {
  ExternalSymbolSearch, ExternalSymbolRegister, LastPriceLoader, ExternalPriceRegister
} from '@domain/price/usecases';
import { ExternalSymbolRepositoryProvider, priceLoaderOf, PriceRepositoriesIntegrator, SearchExternalSymbolRepositories } from '@gateway/data/adapters';
import {
  PriceRepositoriesProvider,
  SearchExternalSymbolRepository
} from '@gateway/data/contracts';
import { SingletonFactory } from '@utils/factory';

export default class PriceUseCasesFactories {
  private externalSymbolSearch: SingletonFactory<ExternalSymbolSearch>;
  private externalSymbolRegister: SingletonFactory<ExternalSymbolRegister>;
  private lastPriceLoader: SingletonFactory<LastPriceLoader>;

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

  ofExternalSymbolSearch(): SingletonFactory<ExternalSymbolSearch> {
    if (!this.externalSymbolSearch) {
      this.externalSymbolSearch = new SingletonFactory(
        () => new ExternalSymbolSearch(
          new SearchExternalSymbolRepositories(
            this.repositories.getExternals()
          )
        )
      );
    }
    return this.externalSymbolSearch;
  }

  ofExternalSymbolRegister(): SingletonFactory<ExternalSymbolRegister> {
    if (!this.externalSymbolRegister) {
      const register = this.repositories.getInternal();
      const repositories: SearchExternalSymbolRepository[] =
        this.repositories.getExternals();
      this.externalSymbolRegister = new SingletonFactory(
        () => new ExternalSymbolRegister(
          new ExternalSymbolRepositoryProvider(
            register,
            repositories,
          )
        )
      );
    }
    return this.externalSymbolRegister;
  }

  private ofExternalPriceRegister(): SingletonFactory<ExternalPriceRegister> {
    const internal = this.repositories.getInternal();
    const externals = this.repositories.getExternals();
    return new SingletonFactory(
      () => new ExternalPriceRegister(
        new PriceRepositoriesIntegrator(internal, internal, ...externals)
      )
    );
  }

  ofLastPriceLoader(): SingletonFactory<LastPriceLoader> {
    if (!this.lastPriceLoader) {
      const internal = this.repositories.getInternal();
      const externalPriceRegisterFactory = this.ofExternalPriceRegister();
      this.lastPriceLoader = new SingletonFactory(
        () => new LastPriceLoader(
          priceLoaderOf(
            internal,
            externalPriceRegisterFactory.make(),
          )
        )
      );
    }
    return this.lastPriceLoader;
  }
}
