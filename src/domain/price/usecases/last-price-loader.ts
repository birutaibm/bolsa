import { Price } from '@domain/price/entities';
import { PriceUnavailableError } from '@errors/price-unavailable';

export type LoadFunctions<T> = Array<(ticker: string) => Promise<T[]>>;

export class LastPriceLoader {
  constructor(
    private readonly loaders: LoadFunctions<Price>,
  ) {}

  async load(ticker: string): Promise<Price> {
    const allPrices: Price[] = [];
    const errors: Error[] = [];
    for (const load of this.loaders) {
      try {
        const prices = await load(ticker);
        if (prices && prices.length) {
          allPrices.push(...prices);
        }
      } catch (error) {
        errors.push(error)
      }
    }
    const price = allPrices.reduce(this.selectTheLastOne, allPrices[0]);
    if (price) return price;
    throw new PriceUnavailableError(ticker, ...errors);
  }

  private selectTheLastOne = (p1: Price, p2: Price) =>
    (p1.date.getTime() > p2.date.getTime()) ? p1 : p2;
}
