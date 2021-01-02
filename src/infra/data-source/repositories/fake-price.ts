import { ExternalSymbolDictionary, LoadPriceRepository, SavePriceFromExternalRepository } from '@data/contracts';
import { PriceDTO } from '@data/dto';
import { ExternalSymbolNotFoundError } from '@data/errors';
import { assets } from '@infra/data-source/in-memory';
import { assetAdapter } from '@infra/adapters';
import { Asset } from '../model/asset';

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
    const existent = assets.find(asset => asset.ticker === price[0].ticker);
    let asset: Asset;
    if (existent) {
      asset = existent;
      asset.prices.push(...price.map(p => ({
          date: p.date.getTime(),
          open: p.open,
          close: p.close,
          min: p.min,
          max: p.max,
        }))
      );
    } else {
      asset = assetAdapter.fromPriceDTOs(price)[0];
    }
    asset.externals[externalName] = externalSymbol;
    return assetAdapter.toPriceDTOs(asset);
  }

  async loadPriceByTicker(ticker: string): Promise<PriceDTO[] | undefined> {
    const asset = assets.find(asset => asset.ticker === ticker);
    if (!asset) {
      return undefined;
    }
    return assetAdapter.toPriceDTOs(asset);
  }
}
