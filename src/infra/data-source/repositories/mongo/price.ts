import { InternalRepository } from '@gateway/data/contracts';
import { AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO } from '@gateway/data/dto';
import { AssetNotFoundError } from '@errors/asset-not-found';
import { ExternalSymbolNotFoundError } from '@errors/external-symbol-not-found';

import Assets, { AssetDocument, adapter } from '@infra/data-source/model/asset';
import { Mongo } from '@infra/data-source/database';
import { PriceUnavailableError } from '@errors/price-unavailable';

export class MongoPriceRepository implements InternalRepository {
  constructor(
    mongo: Mongo,
  ) {
    mongo.connect();
  }

  async registryExternalSymbol(
    { ticker, source, externalSymbol }: SymbolDictionaryEntryDTO
  ): Promise<SymbolDictionaryEntryDTO> {
    const existent = await Assets.findOne({ ticker });
    let asset: AssetDocument;
    if (existent) {
      asset = existent;
    } else {
      asset = await Assets.create({
        ticker,
        name: ticker,
        prices: [],
      });
    }
    asset.externals.set(source, externalSymbol);
    const saved = await asset.save();
    return { ticker, source, externalSymbol };
  }

  async getExternalSymbol(
    ticker: string, externalLibrary: string
  ): Promise<string> {
    const asset = await Assets.findOne({ ticker });
    if (asset && asset.externals) {
      const symbol = asset.externals.get(externalLibrary);
      if (symbol) {
        return symbol;
      }
    }
    throw new ExternalSymbolNotFoundError(externalLibrary, ticker);
  }

  async save(ticker: string, prices: PriceDTO[]): Promise<AssetPriceDTO[]> {
    const existent = await Assets.findOne({ ticker });
    let asset: AssetDocument;
    if (existent) {
      asset = existent;
      asset.prices.push(
        ...prices.map(p => ({
          date: p.date.getTime(),
          open: p.open,
          close: p.close,
          min: p.min,
          max: p.max,
        }))
      );
    } else {
      const assetPrices: AssetPriceDTO[] = prices.map(price => ({
        ...price,
        ticker,
        name: ticker,
      }));
      asset = await Assets.create(adapter.fromPriceDTOs(assetPrices)[0]);
    }
    return adapter.toPriceDTOs(await asset.save());
  }

  async loadPriceByTicker(ticker: string): Promise<AssetPriceDTO[]> {
    let asset: AssetDocument | null;
    try {
      asset = await Assets.findOne({ ticker });
    } catch (error) {
      throw new PriceUnavailableError(ticker, error);
    }
    if (!asset) {
      throw new AssetNotFoundError(ticker);
    }
    return adapter.toPriceDTOs(asset);
  }
}
