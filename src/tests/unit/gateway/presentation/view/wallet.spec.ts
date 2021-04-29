import { company, datatype, finance, name as user } from 'faker';

import { Persisted } from '@utils/types';

import {
  Asset, Investor, Operation, Position, Wallet
} from '@domain/wallet/entities';

import { walletView } from '@gateway/presentation/view';
import { fakeTicker } from '@mock/price';

let id: string;
let name: string;
let investorId: string;
let investorName: string;
let owner: Investor;
let asset: Persisted<Asset>;
let date: Date;
let quantity: number;
let value: number;

describe('Wallet view', () => {
  beforeAll(() => {
    id = datatype.number().toString();
    name = finance.accountName();
    investorId = datatype.hexaDecimal(24);
    investorName = user.findName();
    owner = new Investor(investorId, investorName);
    asset = {
      id: datatype.hexaDecimal(24),
      ticker: fakeTicker(),
      name: company.companyName(),
    };
    date = new Date();
    quantity = datatype.number();
    value = -1 * Number(finance.amount());
  });

  it('should be able to format empty wallet data', () => {
    const wallet = new Wallet(id, name, owner);
    expect(walletView(wallet)).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      positions: {closed: [], opened: []},
      monetary: {totalSpend: 0, totalReceived: 0},
    }));
  });

  it('should be able to format wallet data with empty position', () => {
    const wallet = new Wallet(id, name, owner);
    new Position(datatype.number().toString(), asset, wallet);
    const view = walletView(wallet);
    expect(view).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      monetary: {totalSpend: 0, totalReceived: 0},
    }));
    expect(view.positions.closed.length).toBe(1);
  });

  it('should be able to format filled wallet data', () => {
    const wallet = new Wallet(id, name, owner);
    const position = new Position(datatype.number().toString(), asset, wallet);
    new Operation(datatype.number().toString(), date, quantity, value, position);
    const view = walletView(wallet);
    expect(view).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      monetary: {totalSpend: -value, totalReceived: 0},
    }));
    expect(view.positions.opened.length).toBe(1);
    expect(view.open).toEqual(date.toISOString());
  });
});
