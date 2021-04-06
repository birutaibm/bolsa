import { Persisted } from '@utils/types';

import {
  Asset, Investor, Operation, Position, Wallet
} from '@domain/wallet/entities';

import { operationView } from '@gateway/presentation/view/operation';

let id: string;
let walletName: string;
let investorId: string;
let investorName: string;
let owner: Investor;
let asset: Persisted<Asset>;
let position: Persisted<Position>;
let date: Date;
let quantity: number;
let value: number;

describe('Wallet view', () => {
  beforeAll(() => {
    id = 'walletId';
    walletName = 'My Wallet';
    investorId = 'investorId';
    investorName = 'My Name';
    owner = new Investor(investorId, investorName);
    asset = { id: 'assetId', ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    const wallet = new Wallet('walletId', walletName, owner);
    position = new Position('positionId', asset, wallet);
    date = new Date();
    quantity = 100;
    value = -2345;
  });

  it('should be able to format operation data', () => {
    const operation = new Operation(id, date, quantity, value, position);
    expect(operationView(operation)).toEqual(expect.objectContaining({
      id, date: date.toISOString(), quantity, value,
      position: expect.objectContaining({
        asset, wallet: expect.objectContaining({
          name: walletName, owner: expect.objectContaining({ name: investorName })
        }),
      }),
    }));
  });
});
