import { datatype } from 'faker';

import { ExternalPriceLoaderError } from '@errors/external-price-loader';
import { AssetNotFoundError } from '@errors/not-found';
import { MayBePromise } from '@utils/types';

import { RequiredFunctionalities } from '@domain/price/usecases/external-price-register';

import { PriceDTO, AssetPriceDTO } from '@gateway/data/dto';
import { fakePrice, fakeTicker } from '@mock/price';

type Compatible = () => MayBePromise<PriceDTO[]>;

type Data = {
  [ticker: string]: {
    symbol: string;
    price?: PriceDTO[]
  };
}

type Externals = {
  [name: string]: Data;
}

class Functionalities implements RequiredFunctionalities {
  constructor(
    private readonly externals: Externals,
  ) {}

  private getCompatibleExternals(ticker: string): Compatible[] {
    const compatible: Compatible[] = [];
    Object.keys(this.externals).forEach(name => {
      const data = this.externals[name][ticker];
      if (data) {
        const func = () => {
          const { price } = data;
          if (!price) {
            throw new ExternalPriceLoaderError(name, 'Some generic external message');
          }
          return price;
        };
        compatible.push(func);
      }
    });
    return compatible;
  }

  checkThereIsSomeExternal(): boolean {
    return Object.keys(this.externals).length > 0;
  }

  async getExternalPrices(ticker: string): Promise<PriceDTO[]> {
    const promises = this.getCompatibleExternals(ticker).map(load => load());
    if (promises.length === 0) {
      throw new AssetNotFoundError(ticker);
    }
    return await Promise.race(promises);
  }

  async putPrices(ticker: string, prices: PriceDTO[]): Promise<AssetPriceDTO[]> {
    return prices.map(price => ({...price, ticker, name: ticker}));
  }
}

export function create() {
  const price = fakePrice();
  const externalSource = datatype.string();
  const ticker = {
    filled: fakeTicker(),
    empty: fakeTicker(),
    unknown: fakeTicker(),
    inexistent: datatype.string(6),
  };
  const externals: Externals = {
    [externalSource]: {
      [ticker.filled]: {
        symbol: datatype.string(10),
        price: [price]
      },
      [ticker.empty]: {
        symbol: datatype.string(10),
        price: []
      },
      [ticker.unknown]: {
        symbol: datatype.string(10),
      }
    },
  };
  const functionalities = new Functionalities(externals);
  return {price, ticker, functionalities};
}
