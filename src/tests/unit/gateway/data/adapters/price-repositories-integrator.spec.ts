import { PriceUnavailableError } from '@errors/price-unavailable';

import { PriceRepositoriesIntegrator } from '@gateway/data/adapters';
import {
  SavePricesRepository,
  ExternalSymbolDictionary,
  LoadExternalPriceRepository,
} from '@gateway/data/contracts';

import {
  FakeExternalPriceRepository, FakePriceRepository
} from '@mock/data-source/repositories';

let saver: SavePricesRepository;
let dictionary: ExternalSymbolDictionary;
let loader: LoadExternalPriceRepository[];
let adapter: PriceRepositoriesIntegrator;

describe('PriceRepositoriesIntegrator', () => {
  beforeAll(() => {
    const internalPrices = new FakePriceRepository();
    const externalPrices = new FakeExternalPriceRepository();

    saver = internalPrices;
    dictionary = internalPrices;
    loader = [externalPrices];

    adapter = new PriceRepositoriesIntegrator(saver, dictionary, ...loader);
  });

  it('should be able to check that there is external sources', () => {
    expect(adapter.checkThereIsSomeExternal()).toBeTruthy();
  });

  it('should be able to check when there is no external sources', () => {
    const adapter = new PriceRepositoriesIntegrator(saver, dictionary);
    expect(adapter.checkThereIsSomeExternal()).toBeFalsy();
  });

  it('should be able to delegate putPrice to saver', async done => {
    const sFunction = jest.spyOn(saver, 'save');
    expect(sFunction).toHaveBeenCalledTimes(0);
    await adapter.putPrices('ticker', []);
    expect(sFunction).toHaveBeenCalledTimes(1);
    done();
  });

  it('should be able to get external prices', async done => {
    await expect(
      adapter.getExternalPrices('ITUB4')
    ).resolves.toEqual([]);
    done();
  });

  it('should not be able to get external prices from ticker that has no registered symbol', async done => {
    await expect(
      adapter.getExternalPrices('ticker')
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });
});
