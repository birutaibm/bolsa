import { Price } from '@domain/price/entities';
import { LastPriceLoader } from '@domain/price/usecases/last-price-loader';
import { AssetNotFoundError } from '@errors/asset-not-found';
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
    await expect(
      new LastPriceLoader([]).load(ticker)
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });

  it('should reject with PriceUnavailableError if load function fails', async (done) => {
    await expect(
      new LastPriceLoader([ doNotLoad ]).load(ticker)
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });

  it('should reject with AssetNotFoundError if load function returns nothing', async (done) => {
    await expect(
      new LastPriceLoader([ loadEmpty ]).load(ticker)
    ).rejects.toBeInstanceOf(AssetNotFoundError);
    done();
  });

  it('should be able to load prices', async (done) => {
    await expect(
      new LastPriceLoader([ load1 ]).load(ticker)
    ).resolves.toEqual(older);
    done();
  });

  it('should be able to load prices even if some load function fails', async (done) => {
    await expect(
      new LastPriceLoader([ doNotLoad, load2 ]).load(ticker)
    ).resolves.toEqual(newer);
    done();
  });

  it('should be able to load prices even if some load function returns nothing', async (done) => {
    await expect(
      new LastPriceLoader([ loadEmpty, load1 ]).load(ticker)
    ).resolves.toEqual(older);
    done();
  });

  it('should be able to load the most recent price', async (done) => {
    await expect(
      new LastPriceLoader([ load1, load2 ]).load(ticker)
    ).resolves.toEqual(newer);
    done();
  });
});
