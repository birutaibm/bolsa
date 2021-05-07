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
let assetEntity: Persisted<Asset>;
let asset: object;
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
    assetEntity = {
      id: datatype.hexaDecimal(24),
      ticker: fakeTicker(),
      name: company.companyName(),
      lastPrice: {
        date: new Date(),
        price: Number(finance.amount()),
      },
    };
    asset = { ...assetEntity, lastPrice: { ...assetEntity.lastPrice,
      date: assetEntity.lastPrice?.date.toISOString(),
    }};
    date = new Date();
    quantity = datatype.number();
    value = -1 * Number(finance.amount());
  });

  it('should be able to format empty wallet data', () => {
    const wallet = new Wallet(id, name, owner);
    expect(walletView(wallet)).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      positions: [],
    }));
  });

  it('should be able to format wallet data with empty position', () => {
    const wallet = new Wallet(id, name, owner);
    const positionId = datatype.number().toString();
    new Position(positionId, assetEntity, wallet);
    const view = walletView(wallet);
    expect(view).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      positions: [expect.objectContaining({
        id: positionId,
        asset, quantity: 0, monetary: {totalSpend: 0, totalReceived: 0},
      })],
    }));
  });

  it('should be able to format filled wallet data', () => {
    const wallet = new Wallet(id, name, owner);
    const positionId = datatype.number().toString();
    const position = new Position(positionId, assetEntity, wallet);
    new Operation(datatype.number().toString(), date, quantity, value, position);
    const view = walletView(wallet);
    expect(view).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      positions: [expect.objectContaining({
        id: positionId,
        asset, quantity,
        open: date.toISOString(),
        monetary: {totalSpend: -value, totalReceived: 0},
      })],
    }));
  });
});
