import { Asset, Investor, Operation, Position, Wallet } from '@domain/wallet/entities';
import { walletView } from '@gateway/presentation/view';
import { Persisted } from '@utils/types';

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
    const wallet = Object.assign(new Wallet(name, owner), { id });
    expect(walletView(wallet)).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      positions: [],
    }));
  });

  it('should be able to format wallet data with empty position', () => {
    const wallet = Object.assign(new Wallet(name, owner), { id });
    Object.assign(new Position(asset, wallet), { id: 'positionId' });
    expect(walletView(wallet)).toEqual(expect.objectContaining({
      id, name, owner: expect.objectContaining({ name: investorName }),
      positions: [expect.objectContaining({
        asset, operations: [],
      })],
    }));
  });

  it('should be able to format filled wallet data', () => {
    const wallet = Object.assign(new Wallet(name, owner), { id });
    const position = Object.assign(
      new Position(asset, wallet),
      { id: 'positionId', },
    );
    Object.assign(
      new Operation(date, quantity, value, position),
      { id: 'operationId' }
    );
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
