import {
  AssetNotFoundError, ExternalSymbolNotFoundError
} from '@errors/not-found';
import { Persisted } from '@utils/types';

import { AssetData, InternalPriceRepository } from '@gateway/data/contracts';
import {
  AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO
} from '@gateway/data/dto';

import { Asset, adapter } from '@infra/data-source/model/asset';

import { assets } from './price-data';

export class FakePriceRepository implements InternalPriceRepository {
  loadAssetDataById(id: string): AssetData {
    const asset = assets.find(asset => asset.id === id);
    if (!asset) {
      throw new AssetNotFoundError(id);
    }
    return {
      id, ticker: asset.ticker, name: asset.name || asset.ticker,
      prices: asset.prices.map(price => ({
        date: new Date(price.date),
        open: price.open,
        close: price.close,
        high: price.max,
        low: price.min,
      })),
    };
  }

  registryExternalSymbol(
    { ticker, source, externalSymbol }: SymbolDictionaryEntryDTO
  ): Persisted<SymbolDictionaryEntryDTO> {
    const existent = assets.find(asset => asset.ticker === ticker);
    let asset: Asset;
    if (existent) {
      asset = existent;
    } else {
      asset = {
        id: String(assets.length),
        ticker,
        name: ticker,
        externals: new Map(),
        prices: [],
      };
      assets.push(asset);
    }
    asset.externals.set(source, externalSymbol);
    return { ticker, source, externalSymbol, id: asset.id };
  }

  getExternalSymbol(
    ticker: string, externalLibrary: string
  ): string {
    const asset = assets.find(asset => asset.ticker === ticker);
    if (asset) {
      const symbol = asset.externals.get(externalLibrary);
      if (symbol) {
        return symbol;
      }
    }
    throw new ExternalSymbolNotFoundError(externalLibrary, ticker);
  }

  save(ticker: string, prices: PriceDTO[]): AssetPriceDTO[] {
    const existent = assets.find(asset => asset.ticker === ticker);
    let asset: Asset;
    if (existent) {
      asset = existent;
      asset.prices.push(...adapter.priceDTOToPriceField(prices));
    } else if (prices.length === 0) {
      return [];
    } else {
      asset = {
        id: String(assets.length),
        ticker,
        name: ticker,
        externals: new Map(),
        prices: adapter.priceDTOToPriceField(prices),
      };
      assets.push(asset);
    }
    return adapter.toPriceDTOs(asset);
  }

  loadPriceByTicker(ticker: string): AssetPriceDTO[] {
    const asset = assets.find(asset => asset.ticker === ticker);
    if (!asset) {
      throw new AssetNotFoundError(ticker);
    }
    return adapter.toPriceDTOs(asset);
  }
}
