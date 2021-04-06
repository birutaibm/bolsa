import { Persisted } from '@utils/types';

import {
  Asset, Investor, Operation, Position, Wallet
} from '@domain/wallet/entities';

import { walletView } from '@gateway/presentation/view';

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
    id = 'walletId';
    name = 'My Wallet';
    investorId = 'investorId';
    investorName = 'My Name';
    owner = new Investor(investorId, investorName);
    asset = { id: 'assetId', ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    date = new Date();
    quantity = 100;
    value = -2345;
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
    new Position('positionId', asset, wallet);
    expect(walletView(wallet)).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      positions: [expect.objectContaining({
        asset, operations: [],
      })],
    }));
  });

  it('should be able to format filled wallet data', () => {
    const wallet = new Wallet(id, name, owner);
    const position = new Position('positionId', asset, wallet);
    new Operation('operationId', date, quantity, value, position);
    expect(walletView(wallet)).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      positions: [expect.objectContaining({
        asset, operations: [expect.objectContaining({
          date: date.toISOString(), quantity, value,
        })],
      })],
    }));
  });
});
