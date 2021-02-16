import { PriceRepositoriesIntegrator } from '@gateway/data/adapters';
import {
  SavePricesRepository,
  ExternalSymbolDictionary,
  LoadExternalPriceRepository,
} from '@gateway/data/contracts';
import { PriceDTO } from '@gateway/data/dto';

let saver: SavePricesRepository;
let dictionary: ExternalSymbolDictionary;
let loader: LoadExternalPriceRepository[];
let adapter: PriceRepositoriesIntegrator;

describe('PriceRepositoriesIntegrator', () => {
  beforeAll(() => {
    saver = {
      save: async (ticker: string, price: PriceDTO[]) => {
        return price.map(p => ({
          ...p,
          ticker,
          name: ticker,
        }));
      }
    };
    dictionary = {
      getExternalSymbol: async () => 'symbol'
    };
    loader = [{
      name: 'source',
      loadPriceBySymbol: async (symbol: string) => []
    }];
    adapter = new PriceRepositoriesIntegrator(saver, dictionary, ...loader);
  });

  it('should be able to check that there is external sources', () => {
    expect(adapter.checkThereIsSomeExternal()).toBeTruthy();
  });

  it('should be able to check when there is no external sources', () => {
    const adapter = new PriceRepositoriesIntegrator(saver, dictionary);
    expect(adapter.checkThereIsSomeExternal()).toBeFalsy();
  });

  it('should be able to obtain the appropriate bridge function', async done => {
    const sFunction = jest.spyOn(saver, 'save');
    expect(sFunction).toHaveBeenCalledTimes(0);
    await adapter.putPrices('ticker', []);
    expect(sFunction).toHaveBeenCalledTimes(1);
    done();
  });

  //TODO:Test getExternalPrices function behaviors
});
