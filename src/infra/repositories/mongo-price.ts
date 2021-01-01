import { ExternalSymbolDictionary, LoadPriceRepository, SavePriceFromExternalRepository } from '@data/contracts';
import { PriceDTO } from '@data/dto';
import { ExternalSymbolNotFoundError } from '@data/errors';
import Assets, { Asset } from '@infra/model/asset';
import { Mongo } from '@infra/database';

export class MongoPriceRepository implements LoadPriceRepository, SavePriceFromExternalRepository, ExternalSymbolDictionary {
  constructor(
    mongo: Mongo,
  ) {
    mongo.connect();
  }

  async getExternalSymbol(ticker: string, externalLibrary: string): Promise<string> {
    const asset = await Assets.findOne({ ticker });
    if (asset && asset.externals) {
      const symbol = asset.externals[externalLibrary];
      if (symbol) {
        return symbol;
      }
    }
    throw new ExternalSymbolNotFoundError(externalLibrary, ticker);
  }

  async save(externalName: string, externalSymbol: string, price: PriceDTO[]): Promise<PriceDTO[]> {
    const ticker = price[0].ticker;
    const existent = await Assets.findOne({ ticker });
    const asset = existent || await Assets.create({
      ticker,
      prices: [],
      externals: {},
    });
    if (!existent && price[0].name) {
      asset.name = price[0].name;
    }

    asset.prices = [
      ...asset.prices,
      ...price.map(p => ({
        date: p.date.getTime(),
        open: p.open,
        close: p.close,
        min: p.min,
        max: p.max,
      })),
    ];
    Object.keys(asset.externals).forEach(key => {
      if (key.startsWith('$')) {
        delete asset.externals[key];
      }
    });
    asset.externals = {
      ...asset.externals,
      [externalName]: externalSymbol
    };

    return this.asPriceDTOs(await asset.save());
  }

  async loadPriceByTicker(ticker: string): Promise<PriceDTO[] | undefined> {
    const asset = await Assets.findOne({ ticker });
    if (!asset) {
      return undefined;
    }
    return this.asPriceDTOs(asset);
  }

  private asPriceDTOs = (saved: Asset) => saved.prices.map(price => ({
    ticker: saved.ticker,
    name: saved.name || saved.ticker,
    open: price.open,
    close: price.close,
    min: price.min,
    max: price.max,
    date: new Date(price.date),
  }));
}
