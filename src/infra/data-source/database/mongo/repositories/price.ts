import {
  AssetNotFoundError, ExternalSymbolNotFoundError
} from '@errors/not-found';
import { PriceUnavailableError } from '@errors/price-unavailable';
import { Persisted } from '@utils/types';

import { InternalPriceRepository } from '@gateway/data/contracts';
import {
  AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO,
} from '@gateway/data/dto';

import Assets, { AssetDocument, adapter } from '@infra/data-source/model/asset';

export class MongoPriceRepository implements InternalPriceRepository {
  async registryExternalSymbol(
    { ticker, source, externalSymbol }: SymbolDictionaryEntryDTO
  ): Promise<Persisted<SymbolDictionaryEntryDTO>> {
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
    return { ticker, source, externalSymbol, id: asset.id };
  }

  async getExternalSymbol(
    ticker: string, externalLibrary: string
  ): Promise<string> {
    const asset = await Assets.findOne({ ticker });
    if (asset) {
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
      asset.prices.push(...adapter.priceDTOToPriceField(prices));
    } else {
      const assetPrices = {
        ticker,
        name: ticker,
        prices: adapter.priceDTOToPriceField(prices),
      };
      asset = await Assets.create(assetPrices);
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

  async loadAssetDataById(id: string): Promise<{id: string; ticker: string; name: string;}> {
    const asset = await Assets.findById(id);
    if (!asset) {
      throw new AssetNotFoundError(id);
    }
    return {
      id: asset.id,
      ticker: asset.ticker,
      name: asset.name || asset.ticker,
    };
  }
}
