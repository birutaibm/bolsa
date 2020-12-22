import { LoadPriceRepository } from '@data/contracts';
import { PriceDTO } from '@data/dto';
import { assets } from '@infra/data-source';

export class FakePriceRepository implements LoadPriceRepository {
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
