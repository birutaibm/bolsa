import { Price } from '@domain/entities';
import { PriceUnavailableError } from '@domain/errors';
import { LastPriceLoader } from '@domain/usecases';
import { LoadPriceRepository } from '@data/contracts';
import { ExternalPriceRegisterService } from '@data/services';

export class LastPriceLoaderService implements LastPriceLoader {
  private readonly externalPriceRegisters: ExternalPriceRegisterService[];

  constructor(
    private readonly loadPriceRepository: LoadPriceRepository,
    ...externalPriceRegisters: ExternalPriceRegisterService[]
  ) {
    this.externalPriceRegisters = externalPriceRegisters;
  }

  private selectTheLastOne = (p1: Price, p2: Price) =>
    (p1.date.getTime() > p2.date.getTime()) ? p1 : p2;

  async load(ticker: string): Promise<Price> {
    const loaders = [
      this.loadPriceRepository.loadPriceByTicker,
      ...this.externalPriceRegisters.map(service => service.registry),
    ];
    for (const load of Object.values(loaders)) {
      const prices = await load(ticker);
      if (prices && prices.length) {
        return prices.reduce(this.selectTheLastOne, prices[0]);
      }
    }
    throw new PriceUnavailableError(ticker);
  }
}
