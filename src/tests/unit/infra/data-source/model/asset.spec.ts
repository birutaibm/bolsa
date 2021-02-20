import { AssetPriceDTO } from '@gateway/data/dto';
import { Asset, assetAdapter } from '@infra/data-source/model';

let assetWith2Prices: Asset;
let assetToday: Asset;
let assetOther: Asset;
let prices: AssetPriceDTO[];
let priceYesterday: AssetPriceDTO;
let priceToday: AssetPriceDTO;
let priceOther: AssetPriceDTO;

describe('Mongo price repository', () => {
  beforeAll(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate()-1);
    const assetPriceToday = {
      date: today.getTime(),
      open: 14.32,
      close: 14.32,
      min: 14.32,
      max: 14.32,
    };
    const assetBase = { ticker: 'ticker', externals: new Map() };
    assetToday = { ...assetBase, prices: [assetPriceToday]};
    assetOther = {
      ticker: 'other',
      externals: new Map(),
      prices: [assetPriceToday],
    };
    assetWith2Prices = {
      ...assetBase,
      prices: [{
        date: yesterday.getTime(),
        open: 23.43,
        close: 23.43,
        min: 23.43,
        max: 23.43,
      }, assetPriceToday],
    };
    priceYesterday = {
      ticker: 'ticker',
      name: 'ticker',
      date: yesterday,
      open: 23.43,
      close: 23.43,
      min: 23.43,
      max: 23.43,
    };
    priceToday = {
      ticker: 'ticker',
      name: 'ticker',
      date: today,
      open: 14.32,
      close: 14.32,
      min: 14.32,
      max: 14.32,
    };
    priceOther = {
      ticker: 'other',
      name: 'other',
      date: today,
      open: 14.32,
      close: 14.32,
      min: 14.32,
      max: 14.32,
    };
    prices = [priceYesterday, priceToday ];
  });

  it('should be able to translate asset model to priceDTOs', () => {
    expect(
      assetAdapter.toPriceDTOs(assetWith2Prices)
    ).toEqual(expect.arrayContaining(prices));
  });

  it('should be able to translate single priceDTO to asset model', () => {
    expect(
      assetAdapter.fromPriceDTO(priceToday)
    ).toEqual(expect.objectContaining(assetToday));
  });

  it('should be able to translate priceDTOs with same ticker to single asset model', () => {
    expect(
      assetAdapter.fromPriceDTOs(prices)
    ).toEqual([expect.objectContaining(assetWith2Prices)]);
  });

  it('should be able to translate priceDTOs with two tickers to two asset model', () => {
    expect(
      assetAdapter.fromPriceDTOs([priceToday, priceOther])
    ).toEqual(expect.arrayContaining([
      expect.objectContaining(assetToday),
      expect.objectContaining(assetOther),
    ]));
  });
});
