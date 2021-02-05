import { Price } from '@domain/entities'
import { NoneExternalSymbolRepository } from '@domain/errors';

type PriceDTO = Omit<Price, 'ticker' | 'name'>;

export interface RequiredFunctionalities<T> {
  checkThereIsSomeExternal:() => boolean;
  getCompatibleExternals(ticker: string): T;
  getExternalPrices(compatible: T): Promise<PriceDTO[]>;
  putPrices(ticker: string, prices: PriceDTO[]): Promise<Omit<Price, 'ticker'>[]>;
}

export class ExternalPriceRegister {
  constructor(
    private readonly worker: RequiredFunctionalities<any>,
  ) {}

  async registry(ticker: string): Promise<Price[]> {
    if (!this.worker.checkThereIsSomeExternal()) {
      throw new NoneExternalSymbolRepository();
    }
    const compatible = this.worker.getCompatibleExternals(ticker);
    const prices = await this.worker.getExternalPrices(compatible);
    const result = await this.worker.putPrices(ticker, prices);
    return result.map(price => ({...price, ticker}));
  }
}
