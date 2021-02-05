import { InternalRepository } from '@data/contracts';
import { AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO } from '@data/dto';
import { AssetNotFoundError, ExternalSymbolNotFoundError } from '@data/errors';

import { assets } from '@infra/data-source/in-memory';
import { assetAdapter } from '@infra/adapters';
import { Asset } from '@infra/data-source/model/asset';

export class FakePriceRepository implements InternalRepository {
  async registryExternalSymbol(
    { ticker, source, externalSymbol }: SymbolDictionaryEntryDTO
  ): Promise<SymbolDictionaryEntryDTO> {
    const existent = assets.find(asset => asset.ticker === ticker);
    let asset: Asset;
    if (existent) {
      asset = existent;
    } else {
      asset = {
        ticker,
        name: ticker,
        externals: {},
        prices: [],
      };
      assets.push(asset);
    }
    asset.externals[source] = externalSymbol;
    return { ticker, source, externalSymbol };
  }

  async getExternalSymbol(
    ticker: string, externalLibrary: string
  ): Promise<string> {
    const asset = assets.find(asset => asset.ticker === ticker);
    if (asset) {
      const symbol = asset.externals[externalLibrary];
      if (symbol) {
        return symbol;
      }
    }
    throw new ExternalSymbolNotFoundError(externalLibrary, ticker);
  }

  async save(ticker: string, prices: PriceDTO[]): Promise<AssetPriceDTO[]> {
    const existent = assets.find(asset => asset.ticker === ticker);
    let asset: Asset;
    if (existent) {
      asset = existent;
      asset.prices.push(...prices.map(p => ({
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
      asset = assetAdapter.fromPriceDTOs(assetPrices)[0];
      assets.push(asset);
    }
    return assetAdapter.toPriceDTOs(asset);
  }

  async loadPriceByTicker(ticker: string): Promise<AssetPriceDTO[]> {
    const asset = assets.find(asset => asset.ticker === ticker);
    if (!asset) {
      throw new AssetNotFoundError(ticker);
    }
    return assetAdapter.toPriceDTOs(asset);
  }
}
