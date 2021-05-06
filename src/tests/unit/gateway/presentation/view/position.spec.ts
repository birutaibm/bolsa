import { company, datatype, finance, name } from 'faker';

import { Persisted } from '@utils/types';

import {
  Asset, Investor, Operation, Position, Wallet
} from '@domain/wallet/entities';

import { positionView } from '@gateway/presentation/view/position';

import { fakeTicker } from '@mock/price';

let id: string;
let walletName: string;
let investorId: string;
let investorName: string;
let owner: Investor;
let assetEntity: Persisted<Asset>;
let asset: object;
let wallet: Persisted<Wallet>;
let date: Date;
let quantity: number;
let value: number;

describe('Position view', () => {
  beforeAll(() => {
    id = datatype.number().toString();
    walletName = finance.accountName();
    investorId = datatype.hexaDecimal(24);
    investorName = name.findName();
    owner = new Investor(investorId, investorName);
    wallet = new Wallet(datatype.number().toString(), walletName, owner);
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

  it('should be able to format empty position data', () => {
    const position = positionView(new Position(id, assetEntity, wallet));
    expect(position).toEqual(expect.objectContaining({
      id, asset, quantity: 0, monetary: {totalSpend: 0, totalReceived: 0},
      wallet: expect.objectContaining({
        name: walletName, owner: expect.objectContaining({ name: investorName })
      }),
    }));
    expect(position).not.toEqual(expect.objectContaining({
      open: expect.anything(),
    }));
    expect(position).not.toEqual(expect.objectContaining({
      close: expect.anything(),
    }));
  });

  it('should be able to format filled position data', () => {
    const position = new Position(id, assetEntity, wallet);
    new Operation(datatype.number().toString(), date, quantity, value, position);
    const view = positionView(position);
    expect(view).toEqual(expect.objectContaining({
      id, asset, open: date.toISOString(), quantity,
      wallet: expect.objectContaining({
        name: walletName, owner: expect.objectContaining({ name: investorName })
      }),
    }));
    expect(view).not.toEqual(expect.objectContaining({
      close: expect.anything(),
    }));
    expect(view.monetary.totalSpend).toBeGreaterThan(0);
    expect(view.monetary.totalReceived).toBe(0);
  });

  it('should be able to format closed position data', () => {
    const position = new Position(id, assetEntity, wallet);
    const open = new Date(date);
    open.setDate(date.getDate() - 1);
    new Operation(datatype.number().toString(), open, quantity, value, position);
    new Operation(datatype.number().toString(), date, -quantity, -value, position);
    const view = positionView(position);
    expect(view).toEqual(expect.objectContaining({
      id, asset, open: open.toISOString(), quantity: 0, close: date.toISOString(),
      wallet: expect.objectContaining({
        name: walletName, owner: expect.objectContaining({ name: investorName })
      }),
    }));
    expect(view.monetary.totalSpend).toBeGreaterThan(0);
    expect(view.monetary.totalReceived).toEqual(view.monetary.totalSpend);
  });
});
