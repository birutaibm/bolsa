import { Asset } from '@infra/data-source/model/asset';

export const assets: Asset[] = [
  {
    ticker: 'BBAS3',
    name: 'Banco do Brasil',
    externals: {},
    prices: [{
      date: 869769877606969,
      open: 23.52,
      close: 25,
      min: 22.9,
      max: 25,
    }, {
      date: 543475856875467,
      open: 23.52,
      close: 25,
      min: 22.9,
      max: 25,
    }],
  }, {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco',
    externals: {},
    prices: [{
      date: 869769877606969,
      open: 23.52,
      close: 25,
      min: 22.9,
      max: 25,
    }, {
      date: 543475856875467,
      open: 23.52,
      close: 25,
      min: 22.9,
      max: 25,
    }],
  }
];
