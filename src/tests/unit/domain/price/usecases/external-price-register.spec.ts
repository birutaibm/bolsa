import { ExternalPriceRegister, RequiredFunctionalities } from '@domain/price/usecases/external-price-register';
import { NoneExternalSymbolRepository } from '@errors/none-external-symbol-repository';
import { AssetPriceDTO, PriceDTO } from '@gateway/data/dto';
import { AssetNotFoundError } from '@errors/asset-not-found';
import { ExternalPriceLoaderError } from '@errors/external-price-loader';
import { PriceUnavailableError } from '@errors/price-unavailable';

type Compatible = () => Promise<PriceDTO[]>;

type Data = {
  [ticker: string]: {
    symbol: string;
    price?: PriceDTO[]
  };
}

type Externals = {
  [name: string]: Data;
}

class External {
  constructor(
    readonly name: string,
    readonly data: Data,
  ) {}

  async loadPriceBySymbol(symbol: string): Promise<PriceDTO[]> {
    const prices = Object.values(this.data).find(value => value.symbol === symbol);
    if (prices?.price) {
      return prices.price;
    }
    throw new ExternalPriceLoaderError(this.name, 'Some generic external message');
  }
}

class Functionalities implements RequiredFunctionalities {
  private readonly externals: External[];

  constructor(
    externals: Externals,
  ) {
    this.externals = Object.keys(externals).map(
      name => new External(name, externals[name])
    );
  }

  private getExternalSymbol(ticker: string, exName: string): string {
    const external = this.externals.find(({name}) => name === exName);
    if (!external || !external.data[ticker]) {
      throw new Error();
    }
    return external.data[ticker].symbol;
  }

  private getCompatibleExternals(ticker: string): Compatible[] {
    const compatible: Compatible[] = [];
    this.externals.forEach((external) => {
      const { name } = external;
      try {
        const symbol = this.getExternalSymbol(ticker, name);
        const func: Compatible = () => external.loadPriceBySymbol(symbol);
        compatible.push(func);
      } catch (error) {
      }
    });
    return compatible;
  }

  checkThereIsSomeExternal(): boolean {
    return this.externals.length > 0;
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

let price: PriceDTO;
let func: Functionalities;
let useCase: ExternalPriceRegister;

describe('ExternalPriceRegister', () => {
  beforeAll(() => {
    price = {
      date: new Date(),
      min: 12.34,
      max: 43.21,
      open: 13.42,
      close: 34.21,
    };
    const externals: Externals = {
      banks: {
        ITUB3: {
          symbol: 'ITUB3.SAO',
          price: [price]
        },
        BBAS3: {
          symbol: 'BBAS3.SAO',
          price: [price]
        },
        BBDC3: {
          symbol: 'BBDC3.SAO',
          price: []
        },
        SAMB11: {
          symbol: 'SAMB11.SAO',
        }
      },
    };
    func = new Functionalities(externals);
    useCase = new ExternalPriceRegister(func);
  });

  it('should be able to registry prices', async (done) => {
    await expect(
      useCase.registry('BBAS3')
    ).resolves.toEqual([{...price, ticker: 'BBAS3', name: 'BBAS3'}]);
    done();
  });

  it('should not be able to registry prices when there is no external price provider', async (done) => {
    jest.spyOn(func, 'checkThereIsSomeExternal').mockReturnValueOnce(false);
    await expect(
      useCase.registry('BBAS3')
    ).rejects.toBeInstanceOf(NoneExternalSymbolRepository);
    done();
  });

  it('should throw asset not found when there is no price for ticker', async (done) => {
    await expect(
      useCase.registry('BBDC3')
    ).rejects.toBeInstanceOf(AssetNotFoundError);
    done();
  });

  it('should throw asset not found when there is no source for ticker', async (done) => {
    await expect(
      useCase.registry('PETR4')
    ).rejects.toBeInstanceOf(AssetNotFoundError);
    done();
  });

  it('should throw price unavailable when price loader fails', async (done) => {
    await expect(
      useCase.registry('SAMB11')
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });
});
