import { Asset, Investor, Operation, Position, Wallet } from '@domain/wallet/entities';
import { walletView } from '@gateway/presentation/view';

let id: string;
let name: string;
let investorId: string;
let investorName: string;
let owner: Investor;
let asset: Asset;
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
    asset = { ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    date = new Date();
    quantity = 100;
    value = -2345;
  });

  it('should be able to format empty wallet data', () => {
    const wallet = Object.assign(new Wallet(name, owner), { id });
    expect(walletView(wallet)).toEqual({
      id, name, owner: { name: investorName }, positions: [],
    });
  });

  it('should be able to format wallet data with empty position', () => {
    const wallet = Object.assign(new Wallet(name, owner), { id });
    new Position(asset, wallet);
    expect(walletView(wallet)).toEqual({
      id, name, owner: { name: investorName }, positions: [{
        asset, operations: [],
      }],
    });
  });

  it('should be able to format filled wallet data', () => {
    const wallet = Object.assign(new Wallet(name, owner), { id });
    const position = new Position(asset, wallet);
    new Operation(date, quantity, value, position);
    expect(walletView(wallet)).toEqual({
      id, name, owner: { name: investorName }, positions: [{
        asset, operations: [{
          date: date.toISOString(), quantity, value,
        }],
      }],
    });
  });
});
