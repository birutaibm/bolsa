import { promise } from '@utils/promise';
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

  private async getCompatibleExternals(ticker: string): Promise<Compatible> {
    const promises: Promise<Compatible>[] = this.externals.map(async (external) => {
      const { name } = external;
      const symbol = await this.dictionary.getExternalSymbol(ticker, name);
      return {
        [name]: {
          external,
          symbol,
        }
      };
    });
    const { resolved } = await promise.all(promises);
    const compatible = resolved.reduce((acc, item) => ({...acc, ...item}), {});
    return compatible;
  }

  async getExternalPrices(ticker: string): Promise<PriceDTO[]> {
    const compatible: Compatible = await this.getCompatibleExternals(ticker);
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
