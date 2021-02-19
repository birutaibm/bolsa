import { InternalRepository } from '@gateway/data/contracts';
import { AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO } from '@gateway/data/dto';
import { AssetNotFoundError } from '@errors/asset-not-found';
import { ExternalSymbolNotFoundError } from '@errors/external-symbol-not-found';

import { Asset, adapter } from '@infra/data-source/model/asset';

export class FakePriceRepository implements InternalRepository {
  private readonly assets: Asset[] = [
    {
      ticker: 'BBAS3',
      name: 'Banco do Brasil',
      externals: new Map(),
      prices: [{
        date: 869769877606969,
        open: 23.52,
        close: 25,
        min: 22.9,
        max: 25,
      }, {
        date: 543475856875467,
        open: 23.52,
        close: 25,
        min: 22.9,
        max: 25,
      }],
    }, {
      ticker: 'ITUB4',
      name: 'Itaú Unibanco',
      externals: new Map(),
      prices: [{
        date: 869769877606969,
        open: 23.52,
        close: 25,
        min: 22.9,
        max: 25,
      }, {
        date: 543475856875467,
        open: 23.52,
        close: 25,
        min: 22.9,
        max: 25,
      }],
    }
  ];

  async registryExternalSymbol(
    { ticker, source, externalSymbol }: SymbolDictionaryEntryDTO
  ): Promise<SymbolDictionaryEntryDTO> {
    const existent = this.assets.find(asset => asset.ticker === ticker);
    let asset: Asset;
    if (existent) {
      asset = existent;
    } else {
      asset = {
        ticker,
        name: ticker,
        externals: new Map(),
        prices: [],
      };
      this.assets.push(asset);
    }
    asset.externals[source] = externalSymbol;
    return { ticker, source, externalSymbol };
  }

  async getExternalSymbol(
    ticker: string, externalLibrary: string
  ): Promise<string> {
    const asset = this.assets.find(asset => asset.ticker === ticker);
    if (asset) {
      const symbol = asset.externals[externalLibrary];
      if (symbol) {
        return symbol;
      }
    }
    throw new ExternalSymbolNotFoundError(externalLibrary, ticker);
  }

  async save(ticker: string, prices: PriceDTO[]): Promise<AssetPriceDTO[]> {
    const existent = this.assets.find(asset => asset.ticker === ticker);
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
      asset = adapter.fromPriceDTOs(assetPrices)[0];
      this.assets.push(asset);
    }
    return adapter.toPriceDTOs(asset);
  }

  async loadPriceByTicker(ticker: string): Promise<AssetPriceDTO[]> {
    const asset = this.assets.find(asset => asset.ticker === ticker);
    if (!asset) {
      throw new AssetNotFoundError(ticker);
    }
    return adapter.toPriceDTOs(asset);
  }
}
