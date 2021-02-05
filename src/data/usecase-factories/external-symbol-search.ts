import { SearchExternalSymbolRepository } from '@data/contracts';
import {
  ExternalSymbolSearch,
  SearchResult,
  RequiredFunctionalities,
} from '@domain/usecases/external-symbol-search';
import { SingletonFactory } from '@domain/utils';

class Functionalities implements RequiredFunctionalities {
  constructor(
    private readonly repositories: SearchExternalSymbolRepository[],
  ) {}

  checkThereIsSomeExternal(): boolean {
    return this.repositories.length > 0;
  }

  getExternalSymbols(ticker: string): Promise<SearchResult>[] {
    return this.repositories.map(async repository => {
      try {
        const symbols = await repository.getExternalSymbols(ticker);
        return {
          [repository.name]: symbols,
        };
      } catch (error) {
        return {};
      }
    });
  }
}

export class ExternalSymbolSearchFactory extends SingletonFactory<ExternalSymbolSearch> {
  constructor(
    ...repositories: SearchExternalSymbolRepository[]
  ) {
    super(
      () => new ExternalSymbolSearch(new Functionalities(repositories))
    );
  }
}
