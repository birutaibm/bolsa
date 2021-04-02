import { Asset, Investor, Operation, Position, Wallet } from '@domain/wallet/entities';
import { positionView } from '@gateway/presentation/view/position';
import { Persisted } from '@utils/types';

let id: string;
let walletName: string;
let investorId: string;
let investorName: string;
let owner: Investor;
let asset: Persisted<Asset>;
let wallet: Persisted<Wallet>;
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
    wallet = new Wallet('walletId', walletName, owner);
    asset = { id: 'assetId', ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    date = new Date();
    quantity = 100;
    value = -2345;
  });

  it('should be able to format empty position data', () => {
    const position = new Position(id, asset, wallet);
    expect(positionView(position)).toEqual(expect.objectContaining({
      id, asset, operations: [], wallet: expect.objectContaining({
        name: walletName, owner: expect.objectContaining({ name: investorName })
      }),
    }));
  });

  it('should be able to format filled position data', () => {
    const position = new Position(id, asset, wallet);
    new Operation('operationId', date, quantity, value, position);
    expect(positionView(position)).toEqual(expect.objectContaining({
      id, asset, wallet: expect.objectContaining({
        name: walletName, owner: expect.objectContaining({ name: investorName })
      }),
      operations: [expect.objectContaining({
        date: date.toISOString(), quantity, value,
      })],
    }));
  });
});
