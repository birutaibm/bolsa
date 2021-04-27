import { ExternalPriceLoaderError } from '@errors/external-price-loader';

import { ExternalRepository } from '@gateway/data/contracts';
import { PriceDTO, ExternalSymbolsDTO } from '@gateway/data/dto';

import { externalSourceName, externalSourceSymbols } from './price-data';

export class FakeExternalPriceRepository implements ExternalRepository {
  readonly name = externalSourceName;
  private readonly symbols = externalSourceSymbols;

  loadPriceBySymbol(symbol: string): PriceDTO[] {
    const symbols = Object.values(this.symbols)
      .map(obj => Object.keys(obj))
      .reduce((acc, arr) => [...acc, ...arr], []);
    if (!symbols.includes(symbol)) {
      throw new ExternalPriceLoaderError(this.name, "can't load symbol");
    }
    return [];
  }

  getExternalSymbols(ticker: string): ExternalSymbolsDTO {
    return this.symbols[ticker];
  }
}
