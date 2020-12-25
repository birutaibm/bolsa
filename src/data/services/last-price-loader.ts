import { Price } from '@domain/entities';
import { PriceUnavailableError } from '@domain/errors';
import { LastPriceLoader } from '@domain/usecases';
import { LoadPriceRepository } from '@data/contracts';
import { ExternalPriceRepository } from '@data/utils';

export class LastPriceLoaderService implements LastPriceLoader {
  private readonly externalPriceRepositories: ExternalPriceRepository[];

  constructor(
    private readonly loadPriceRepository: LoadPriceRepository,
    ...externalPriceRepositories: ExternalPriceRepository[]
  ) {
    this.externalPriceRepositories = externalPriceRepositories;
  }

  private selectTheLastOne = (p1: Price, p2: Price) =>
    (p1.date.getTime() > p2.date.getTime()) ? p1 : p2;

  async load(ticker: string): Promise<Price> {
    const repositories = [
      this.loadPriceRepository,
      ...this.externalPriceRepositories,
    ];
    for (const repository of Object.values(repositories)) {
      const prices = await repository.loadPriceByTicker(ticker);
      if (prices && prices.length) {
        return prices.reduce(this.selectTheLastOne, prices[0]);
      }
    }
    throw new PriceUnavailableError(ticker);
  }
}
