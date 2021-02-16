import {
  ExternalSymbolDictionary,
  LoadExternalPriceRepository,
  SavePricesRepository
} from '@gateway/data/contracts';
import { AssetPriceDTO, PriceDTO } from '@gateway/data/dto';

import {
  RequiredFunctionalities,
} from '@domain/price/usecases/external-price-register';
import { PriceUnavailableError } from '@errors/price-unavailable';

type Compatible = {
  [source: string]: {
    external: LoadExternalPriceRepository,
    symbol: string;
  }
};

export class PriceRepositoriesIntegrator implements RequiredFunctionalities {
  private readonly externals: LoadExternalPriceRepository[];

  constructor(
    private readonly writer: SavePricesRepository,
    private readonly dictionary: ExternalSymbolDictionary,
    ...externals: LoadExternalPriceRepository[]
  ) {
    this.externals = externals;
  }

  checkThereIsSomeExternal(): boolean {
    return this.externals.length > 0;
  }

  private getCompatibleExternals(ticker: string): Compatible {
    const compatible = {} as Compatible;
    this.externals.forEach(async (external) => {
      const { name } = external;
      try {
        const symbol = await this.dictionary.getExternalSymbol(ticker, name);
        compatible[name] = {
          external,
          symbol,
        };
      } catch (error) {
      }
    });
    return compatible;
  }

  getExternalPrices(ticker: string): Promise<PriceDTO[]> {
    const compatible: Compatible = this.getCompatibleExternals(ticker);
    const promises = Object.keys(compatible).map(source => {
      const { external, symbol } = compatible[source];
      return external.loadPriceBySymbol(symbol);
    });
    if (promises.length === 0) {
      throw new PriceUnavailableError(ticker);
    }
    return Promise.race(promises);
  }

  putPrices(ticker: string, prices: PriceDTO[]): Promise<AssetPriceDTO[]> {
    return this.writer.save(ticker, prices);
  }
}
