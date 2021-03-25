import { InternalPriceRepository } from '@gateway/data/contracts';
import { AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO } from '@gateway/data/dto';
import { AssetNotFoundError } from '@errors/asset-not-found';
import { ExternalSymbolNotFoundError } from '@errors/external-symbol-not-found';

import { Asset, adapter } from '@infra/data-source/model/asset';
import { Persisted } from '@domain/wallet/usecases/dtos';

export class FakePriceRepository implements InternalPriceRepository {
  private readonly assets: Asset[] = [
    {
      id: '0',
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
      id: '1',
      ticker: 'ITUB4',
      name: 'Itaú Unibanco',
      externals: new Map().set('external source', 'ITUB4.SAO'),
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

  loadAssetDataById(id: string): { id: string; ticker: string; name: string; } {
    const index = Number(id);
    if (Number.isNaN(index) || index >= this.assets.length) {
      throw new AssetNotFoundError(id);
    }
    const asset = this.assets[index];
    return {id, ticker: asset.ticker, name: asset.name || asset.ticker};
  }

  registryExternalSymbol(
    { ticker, source, externalSymbol }: SymbolDictionaryEntryDTO
  ): Persisted<SymbolDictionaryEntryDTO> {
    const existent = this.assets.find(asset => asset.ticker === ticker);
    let asset: Asset;
    if (existent) {
      asset = existent;
    } else {
      asset = {
        id: String(this.assets.length),
        ticker,
        name: ticker,
        externals: new Map(),
        prices: [],
      };
      this.assets.push(asset);
    }
    asset.externals.set(source, externalSymbol);
    return { ticker, source, externalSymbol, id: asset.id };
  }

  getExternalSymbol(
    ticker: string, externalLibrary: string
  ): string {
    const asset = this.assets.find(asset => asset.ticker === ticker);
    if (asset) {
      const symbol = asset.externals.get(externalLibrary);
      if (symbol) {
        return symbol;
      }
    }
    throw new ExternalSymbolNotFoundError(externalLibrary, ticker);
  }

  save(ticker: string, prices: PriceDTO[]): AssetPriceDTO[] {
    const existent = this.assets.find(asset => asset.ticker === ticker);
    let asset: Asset;
    if (existent) {
      asset = existent;
      asset.prices.push(...adapter.priceDTOToPriceField(prices));
    } else if (prices.length === 0) {
      return [];
    } else {
      asset = {
        id: String(this.assets.length),
        ticker,
        name: ticker,
        externals: new Map(),
        prices: adapter.priceDTOToPriceField(prices),
      };
      this.assets.push(asset);
    }
    return adapter.toPriceDTOs(asset);
  }

  loadPriceByTicker(ticker: string): AssetPriceDTO[] {
    const asset = this.assets.find(asset => asset.ticker === ticker);
    if (!asset) {
      throw new AssetNotFoundError(ticker);
    }
    return adapter.toPriceDTOs(asset);
  }
}
