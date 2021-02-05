import { Price } from '@domain/price/entities';
import { PriceUnavailableError } from '@errors/price-unavailable';

export interface RequiredFunctionalities<T extends Price> {
  getLoadFunctions(): Array<(ticker: string) => Promise<T[]>>
}

export class LastPriceLoader {
  constructor(
    private readonly worker: RequiredFunctionalities<Price>,
  ) {}

  async load(ticker: string): Promise<Price> {
    const loaders = this.worker.getLoadFunctions();
    for (const load of Object.values(loaders)) {
      const prices = await load(ticker);
      if (prices && prices.length) {
        return prices.reduce(this.selectTheLastOne, prices[0]);
      }
    }
    throw new PriceUnavailableError(ticker);
  }

  private selectTheLastOne = (p1: Price, p2: Price) =>
    (p1.date.getTime() > p2.date.getTime()) ? p1 : p2;
}
