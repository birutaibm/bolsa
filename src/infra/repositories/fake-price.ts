import { ExternalSymbolDictionary, LoadPriceRepository, SavePriceFromExternalRepository } from '@data/contracts';
import { PriceDTO } from '@data/dto';
import { ExternalSymbolNotFoundError } from '@data/errors';
import { assets } from '@infra/data-source';

export class FakePriceRepository implements LoadPriceRepository, SavePriceFromExternalRepository, ExternalSymbolDictionary {
  async getExternalSymbol(ticker: string, externalLibrary: string): Promise<string> {
    const asset = assets.find(asset => asset.ticker === ticker);
    if (asset) {
      const symbol = asset.externals[externalLibrary];
      if (symbol) {
        return symbol;
      }
    }
    throw new ExternalSymbolNotFoundError(externalLibrary, ticker);
  }

  async save(externalName: string, externalSymbol: string, price: PriceDTO[]): Promise<PriceDTO[]> {
    const asset = assets.find(asset => asset.ticker === price[0].ticker) || {
      ticker: price[0].ticker,
      name: price[0].name,
      prices: [],
      externals: {},
    };
    asset.prices = [
      ...asset.prices,
      ...price.map(p => ({
        date: p.date.getTime(),
        open: p.open,
        close: p.close,
        min: p.min,
        max: p.max,
      }))
    ];
    asset.externals[externalName] = externalSymbol;
    return asset.prices.map(price => ({
      ...price,
      ticker: asset.ticker,
      name: asset.name,
      date: new Date(price.date),
    }));
  }

  async loadPriceByTicker(ticker: string): Promise<PriceDTO[] | undefined> {
    const asset = assets.find(asset => asset.ticker === ticker);
    if (!asset) {
      return undefined;
    }
    return asset.prices.map(price => ({
      ...price,
      ticker: asset.ticker,
      name: asset.name,
      date: new Date(price.date),
    }));
  }
}
