import { ExternalSymbolDictionary, LoadExternalPriceRepository, SavePricesRepository } from '@data/contracts';
import { AssetPriceDTO } from '@data/dto';
import { NoneExternalSymbolRepository } from '@data/errors';
import { ExternalPriceRegister } from '@domain/usecases';

type Compatible = {
  [source: string]: {
    external: LoadExternalPriceRepository,
    symbol: string;
  }
};

export class ExternalPriceRegisterService implements ExternalPriceRegister {
  private readonly externals: LoadExternalPriceRepository[];

  constructor(
    private readonly writer: SavePricesRepository,
    private readonly dictionary: ExternalSymbolDictionary,
    ...externals: LoadExternalPriceRepository[]
  ) {
    this.externals = externals;
  }

  async registry(ticker: string): Promise<AssetPriceDTO[]> {
    if (this.externals.length === 0) {
      console.log('NoneExternalPriceRepository');
      throw new NoneExternalSymbolRepository();
    }
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
    const promises = Object.keys(compatible).map(source => {
      const { external, symbol } = compatible[source];
      return external.loadPriceBySymbol(symbol);
    });
    const prices = await Promise.race(promises);
    return await this.writer.save(ticker, prices);
  }
}
