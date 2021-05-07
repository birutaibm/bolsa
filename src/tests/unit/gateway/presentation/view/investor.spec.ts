import { company, datatype, finance, name as user } from 'faker';

import { Persisted } from '@utils/types';

import {
  Asset, Investor, Operation, Position, Wallet
} from '@domain/wallet/entities';

import { investorView } from '@gateway/presentation/view/investor';

import { fakeTicker } from '@mock/price';

let id: string;
let name: string;
let walletId: string;
let walletName: string;
let asset: Persisted<Asset>;
let date: Date;
let quantity: number;
let value: number;

describe('Wallet view', () => {
  beforeAll(() => {
    walletId = datatype.number().toString();
    walletName = finance.accountName();
    id = datatype.hexaDecimal(24);
    name = user.findName();
    asset = {
      id: datatype.hexaDecimal(24),
      ticker: fakeTicker(),
      name: company.companyName(),
      lastPrice: {
        date: new Date(),
        price: Number(finance.amount()),
      },
    };
    date = new Date();
    quantity = datatype.number();
    value = -1 * Number(finance.amount());
  });

  it('should be able to format empty investor data', () => {
    const investor = new Investor(id, name);
    expect(investorView(investor)).toEqual(expect.objectContaining({
      id, name, wallets: [],
    }));
  });

  it('should be able to format wallet data with empty wallet', () => {
    const investor = new Investor(id, name);
    new Wallet(walletId, walletName, investor);
    const view = investorView(investor);
    expect(view).toEqual(expect.objectContaining({
      id, name, wallets: [expect.objectContaining({
        name: walletName, id: walletId,
        positions: {opened: [], closed: []},
        monetary: {totalSpend: 0, totalReceived: 0, totalLastPrice: 0},
      })],
    }));
  });

  it('should be able to format filled investor data', () => {
    const investor = new Investor(id, name);
    const wallet = new Wallet(walletId, walletName, investor);
    const position = new Position(datatype.number().toString(), asset, wallet);
    new Operation(datatype.number().toString(), date, quantity, value, position);
    const view = investorView(investor);
    expect(view).toEqual(expect.objectContaining({
      id, name, wallets: [expect.objectContaining({
        name: walletName, id: walletId,
        open: date.toISOString(),
        positions: {
          opened: expect.arrayContaining([expect.stringContaining('')]),
          closed: expect.arrayContaining([]),
        },
        monetary: {
          totalSpend: -value,
          totalReceived: 0,
          totalLastPrice: quantity * ( asset.lastPrice?.price || 0 )
        },
      })],
    }));
  });
});
