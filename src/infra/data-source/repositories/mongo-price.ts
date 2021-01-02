import { ExternalSymbolDictionary, LoadPriceRepository, SavePriceFromExternalRepository } from '@data/contracts';
import { PriceDTO } from '@data/dto';
import { ExternalSymbolNotFoundError } from '@data/errors';
import Assets, { AssetDocument } from '@infra/data-source/model/asset';
import { Mongo } from '@infra/data-source/database';
import { assetAdapter } from '@infra/adapters';

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
    let asset: AssetDocument;
    if (existent) {
      asset = existent;
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
    } else {
      asset = await Assets.create(assetAdapter.fromPriceDTOs(price)[0]);
    }
    asset.externals[externalName] = externalSymbol;

    return assetAdapter.toPriceDTOs(await asset.save());
  }

  async loadPriceByTicker(ticker: string): Promise<PriceDTO[] | undefined> {
    const asset = await Assets.findOne({ ticker });
    if (!asset) {
      return undefined;
    }
    return assetAdapter.toPriceDTOs(asset);
  }
}
