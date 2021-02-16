import { Price } from '@domain/price/entities'
import { PriceUnavailableError } from '@errors/price-unavailable';
import { NoneExternalSymbolRepository } from '@errors/none-external-symbol-repository';
import { AssetNotFoundError } from '@errors/asset-not-found';

type PriceDTO = Omit<Price, 'ticker' | 'name'>;

export interface RequiredFunctionalities {
  checkThereIsSomeExternal:() => boolean;
  getExternalPrices(ticker: string): Promise<PriceDTO[]>;
  putPrices(ticker: string, prices: PriceDTO[]): Promise<Omit<Price, 'ticker'>[]>;
}

export class ExternalPriceRegister {
  constructor(
    private readonly worker: RequiredFunctionalities,
  ) {}

  async registry(ticker: string): Promise<Price[]> {
    if (!this.worker.checkThereIsSomeExternal()) {
      throw new NoneExternalSymbolRepository();
    }
    const prices = await this.getExternalPrices(ticker);
    const result = await this.worker.putPrices(ticker, prices);
    return result.map(price => ({...price, ticker}));
  }

  private async getExternalPrices(ticker: string): Promise<PriceDTO[]> {
    let prices: PriceDTO[];
    try {
      prices = await this.worker.getExternalPrices(ticker);
    } catch (error) {
      if (error.name === 'AssetNotFoundError') {
        throw error
      } else {
        throw new PriceUnavailableError(ticker, error);
      }
    }
    if (prices.length === 0) {
      throw new AssetNotFoundError(ticker);
    }
    return prices;
  }
}
