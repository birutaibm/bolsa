import { Price } from '@domain/entities';
import { PriceUnavailableError } from '@domain/errors';
import { LastPriceLoader } from '@domain/usecases';
import { LoadPriceRepository } from '@data/contracts';

export class LastPriceLoaderService implements LastPriceLoader {
  constructor(
    private readonly loadPriceRepository: LoadPriceRepository,
  ) {}

  private selectTheLastOne = (p1: Price, p2: Price) =>
    (p1.date.getTime() > p2.date.getTime()) ? p1 : p2;

  async load(ticker: string): Promise<Price> {
    const prices = await this.loadPriceRepository.loadPriceByTicker(ticker);
    if (prices && prices.length) {
      return prices.reduce(this.selectTheLastOne, prices[0]);
    }
    // TODO tente carregar de uma fonte externa
    throw new PriceUnavailableError(ticker);
  }
}
