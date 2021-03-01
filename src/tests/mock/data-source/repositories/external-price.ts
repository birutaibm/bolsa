import { ExternalPriceLoaderError } from "@errors/external-price-loader";
import { ExternalRepository } from "@gateway/data/contracts";
import { PriceDTO, ExternalSymbolsDTO } from "@gateway/data/dto";

export class FakeExternalPriceRepository implements ExternalRepository {
  readonly name = 'external source';
  private readonly symbols = {
    ITUB3: {
      'ITUB3.SAO': {},
      'ITUB4.SAO': {},
      'ITSA4.SAO': {},
    },
    ITUB4: {
      'ITUB3.SAO': {},
      'ITUB4.SAO': {},
      'ITSA4.SAO': {},
    }
  };

  async loadPriceBySymbol(symbol: string): Promise<PriceDTO[]> {
    const symbols = Object.values(this.symbols)
      .map(obj => Object.keys(obj))
      .reduce((acc, arr) => [...acc, ...arr], []);
    if (symbols.includes(symbol)) return [];
    throw new ExternalPriceLoaderError(this.name, "can't load symbol");
  }

  getExternalSymbols(ticker: string): Promise<ExternalSymbolsDTO> {
    return this.symbols[ticker];
  }
}
