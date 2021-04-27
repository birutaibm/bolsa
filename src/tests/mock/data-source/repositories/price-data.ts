import { company, datatype, lorem } from 'faker';

import { ExternalSymbolsDTO } from '@gateway/data/dto';

import { Asset } from '@infra/data-source/model/asset';

import { fakePrice, fakeTicker } from '@mock/price';

export const externalSourceName = lorem.words(2);
export const externalSourceSymbols: {[ticker: string]: ExternalSymbolsDTO} = {
  [fakeTicker()]: {
    [datatype.string(9)]: {},
    [datatype.string(9)]: {},
    [datatype.string(9)]: {},
  },
  [fakeTicker()]: {
    [datatype.string(9)]: {},
    [datatype.string(9)]: {},
    [datatype.string(9)]: {},
  }
};

const ticker = Object.keys(externalSourceSymbols)[0];
const symbol = Object.keys(externalSourceSymbols[ticker])[0];

export const assets: Asset[] = [
  {
    id: datatype.hexaDecimal(24),
    ticker,
    name: company.companyName(),
    externals: new Map().set(externalSourceName, symbol),
    prices: [fakePrice(), fakePrice()]
      .map(price => ({ ...price, date: price.date.getTime() })),
  }, {
    id: datatype.hexaDecimal(24),
    ticker: fakeTicker(),
    name: company.companyName(),
    externals: new Map(),
    prices: [fakePrice(), fakePrice()]
      .map(price => ({ ...price, date: price.date.getTime() })),
  }
];
