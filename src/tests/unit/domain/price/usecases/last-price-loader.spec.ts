import { AssetNotFoundError } from '@errors/not-found';
import { PriceUnavailableError } from '@errors/price-unavailable';

import { MayBePromise } from '@utils/types';

import { Price } from '@domain/price/entities';
import { LastPriceLoader } from '@domain/price/usecases/last-price-loader';

import { fakePrice, fakeTicker } from '@mock/price';

type LoadFn = (ticker: string) => MayBePromise<Price[]>;

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
    ticker = fakeTicker();
    older = { ...fakePrice(), ticker, name: ticker };
    newer = { ...fakePrice({date: nextDay(older.date)}), ticker, name: ticker };
    doNotLoad = () => Promise.reject(new Error("Can not load anything"));
    loadEmpty = () => [];
    load1 = () => [older];
    load2 = () => [newer];
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
