import { SearchExternalSymbolRepository } from '@data/contracts';
import { ExternalSymbolsDTO } from '@data/dto';
import { NoneExternalSymbolRepository } from '@data/errors';
import { promise } from '@data/utils';
import { ExternalSymbolSearch, SearchResult } from '@domain/usecases';

export class ExternalSymbolSearchService implements ExternalSymbolSearch {
  private readonly repositories: SearchExternalSymbolRepository[];

  constructor(
    ...repositories: SearchExternalSymbolRepository[]
  ) {
    this.repositories = repositories;
  }

  async search(ticker: string): Promise<SearchResult> {
    const result: SearchResult = {};
    if (this.repositories.length === 0) {
      console.log('NoneExternalSymbolRepository');
      throw new NoneExternalSymbolRepository();
    }
    console.log(`Looking for ${ticker} at repositories`);
    const promises = this.repositories.map(repository =>
      promise.noRejection(() => repository.getExternalSymbols(ticker))
    );
    const symbols = await Promise.all(promises);
    symbols.forEach((symbol, index) => {
      if (Object.keys(symbol).length > 0) {
        const { name } = this.repositories[index];
        result[name] = symbol;
      }
    });
    return result;
  }
}
