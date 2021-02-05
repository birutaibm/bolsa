import {
  ExternalSymbolDictionary,
  LoadExternalPriceRepository,
  SavePricesRepository
} from '@gateway/data/contracts';
import { AssetPriceDTO, PriceDTO } from '@gateway/data/dto';

import {
  ExternalPriceRegister, RequiredFunctionalities,
} from '@domain/price/usecases/external-price-register';
import { SingletonFactory } from '@utils/factory';

type Compatible = {
  [source: string]: {
    external: LoadExternalPriceRepository,
    symbol: string;
  }
};

class Functionalities implements RequiredFunctionalities<Compatible> {
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

  getCompatibleExternals(ticker: string): Compatible {
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

  getExternalPrices(compatible: Compatible): Promise<PriceDTO[]> {
    const promises = Object.keys(compatible).map(source => {
      const { external, symbol } = compatible[source];
      return external.loadPriceBySymbol(symbol);
    });
    return Promise.race(promises);
  }

  putPrices(ticker: string, prices: PriceDTO[]): Promise<AssetPriceDTO[]> {
    return this.writer.save(ticker, prices);
  }
}

export class ExternalPriceRegisterFactory extends SingletonFactory<ExternalPriceRegister> {
  constructor(
    writer: SavePricesRepository,
    dictionary: ExternalSymbolDictionary,
    ...externals: LoadExternalPriceRepository[]
  ) {
    super(() => new ExternalPriceRegister(
      new Functionalities(writer, dictionary, ...externals)
    ));
  }
}
