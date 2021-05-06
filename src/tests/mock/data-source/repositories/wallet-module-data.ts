import { datatype, date, finance, name } from 'faker';

import {
  InvestorData, OperationData, PositionData, WalletData
} from '@gateway/data/contracts';

import { assets } from './price-data';

export const investors: InvestorData[] = [{
  id: '1', // from user id
  name: name.findName(),
  walletIds: ['0'],
}];

export const wallets: WalletData[] = [{
  id: '0',
  name: finance.accountName(),
  ownerId: investors[0].id,
  positionIds: ['0'],
}];

export const positions: PositionData[] = [{
  id: '0',
  asset: {
    id: assets[0].id,
    ticker: assets[0].ticker,
    name: assets[0].name || assets[0].ticker,
    lastPrice: assets[0].prices[0].date > assets[0].prices[1].date
      ? {date: new Date(assets[0].prices[0].date), price: assets[0].prices[0].close}
      : {date: new Date(assets[0].prices[1].date), price: assets[0].prices[1].close},
  },
  walletId: wallets[0].id,
  operationIds: ['0'],
}];

export const operations: OperationData[] = [{
  id: '0',
  date: date.past(),
  quantity: datatype.number(),
  value: -1 * Number(finance.amount()),
  positionId: positions[0].id,
}];
