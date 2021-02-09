import { Price } from '@domain/price/entities';
import { LastPriceLoader } from '@domain/price/usecases/last-price-loader';
import { PriceUnavailableError } from '@errors/price-unavailable';

type LoadFn = (ticker: string) => Promise<Price[]>;

let ticker: string;
let older: Price;
let newer: Price;
let doNotLoad: LoadFn;
let loadEmpty: LoadFn;
let load1: LoadFn;
let load2: LoadFn;

describe('LastPriceLoader', () => {
  beforeAll(() => {
    const nextDay = (date: Date) => {
      date.setDate(date.getDate()+1);
      return date;
    };
    ticker = 'ITUB4';
    older = {
      ticker,
      name: ticker,
      date: new Date(),
      min: 12.34,
      open: 13.24,
      close: 13.42,
      max: 14.32,
    };
    newer = {
      ticker,
      name: ticker,
      date: nextDay(new Date()),
      min: 12.34,
      open: 13.24,
      close: 13.42,
      max: 14.32,
    };
    doNotLoad = async () => {throw new Error("Can not load anything")};
    loadEmpty = async () => [];
    load1 = async (ticker: string) => [older];
    load2 = async (ticker: string) => [newer];
  });

  it('should reject with PriceUnavailableError if there is no load function', async (done) => {
    const noLoadFunctions = { loadFunctions: [] };
    await expect(
      new LastPriceLoader(noLoadFunctions).load(ticker)
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });

  it('should reject with PriceUnavailableError if load function fails', async (done) => {
    const loadFunctions = { loadFunctions: [ doNotLoad ] };
    await expect(
      new LastPriceLoader(loadFunctions).load(ticker)
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });

  it('should reject with PriceUnavailableError if load function returns nothing', async (done) => {
    const loadFunctions = { loadFunctions: [ loadEmpty ] };
    await expect(
      new LastPriceLoader(loadFunctions).load(ticker)
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });

  it('should be able to load prices', async (done) => {
    const loadFunctions = { loadFunctions: [ load1 ] };
    await expect(
      new LastPriceLoader(loadFunctions).load(ticker)
    ).resolves.toEqual(older);
    done();
  });

  it('should be able to load prices even if some load function fails', async (done) => {
    const loadFunctions = { loadFunctions: [ doNotLoad, load2 ] };
    await expect(
      new LastPriceLoader(loadFunctions).load(ticker)
    ).resolves.toEqual(newer);
    done();
  });

  it('should be able to load prices even if some load function returns nothing', async (done) => {
    const loadFunctions = { loadFunctions: [ loadEmpty, load1 ] };
    await expect(
      new LastPriceLoader(loadFunctions).load(ticker)
    ).resolves.toEqual(older);
    done();
  });

  it('should be able to load the most recent price', async (done) => {
    const loadFunctions = { loadFunctions: [ load1, load2 ] };
    await expect(
      new LastPriceLoader(loadFunctions).load(ticker)
    ).resolves.toEqual(newer);
    done();
  });
});
