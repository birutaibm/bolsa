import { InternalRepository } from '@data/contracts';
import { AssetPriceDTO, PriceDTO, SymbolDictionaryEntryDTO } from '@data/dto';
import { AssetNotFoundError, ExternalSymbolNotFoundError } from '@data/errors';
import Assets, { AssetDocument } from '@infra/data-source/model/asset';
import { Mongo } from '@infra/data-source/database';
import { assetAdapter } from '@infra/adapters';

export class MongoPriceRepository implements InternalRepository {
  constructor(
    mongo: Mongo,
  ) {
    mongo.connect();
  }

  async registryExternalSymbol(entry: SymbolDictionaryEntryDTO): Promise<SymbolDictionaryEntryDTO> {
    const { ticker, source, externalSymbol } = entry;
    const existent = await Assets.findOne({ ticker });
    let asset: AssetDocument;
    if (existent) {
      asset = existent;
    } else {
      asset = await Assets.create({
        ticker,
        name: ticker,
        externals: {},
        prices: [],
      });
    }
    asset.externals[source] = externalSymbol;
    await asset.save();
    return entry;
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

  async save(ticker: string, prices: PriceDTO[]): Promise<AssetPriceDTO[]> {
    const existent = await Assets.findOne({ ticker });
    let asset: AssetDocument;
    if (existent) {
      asset = existent;
      asset.prices = [
        ...asset.prices,
        ...prices.map(p => ({
          date: p.date.getTime(),
          open: p.open,
          close: p.close,
          min: p.min,
          max: p.max,
        })),
      ];
    } else {
      const assetPrices: AssetPriceDTO[] = prices.map(price => ({
        ...price,
        ticker,
        name: ticker,
      }));
      asset = await Assets.create(assetAdapter.fromPriceDTOs(assetPrices)[0]);
    }

    return assetAdapter.toPriceDTOs(await asset.save());
  }

  async loadPriceByTicker(ticker: string): Promise<AssetPriceDTO[]> {
    const asset = await Assets.findOne({ ticker });
    if (!asset) {
      throw new AssetNotFoundError(ticker);
    }
    return assetAdapter.toPriceDTOs(asset);
  }
}
