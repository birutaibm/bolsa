import { Asset, Investor, Operation, Position, Wallet } from '@domain/wallet/entities';
import { positionView } from '@gateway/presentation/view/position';

let id: string;
let walletName: string;
let investorId: string;
let investorName: string;
let owner: Investor;
let asset: Asset;
let wallet: Wallet;
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
    wallet = new Wallet(walletName, owner);
    asset = { ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    date = new Date();
    quantity = 100;
    value = -2345;
  });

  it('should be able to format empty position data', () => {
    const position = Object.assign(new Position(asset, wallet), { id });
    expect(positionView(position)).toEqual({
      id, asset, wallet: { name: walletName, owner: { name: investorName }},
      operations: [],
    });
  });

  it('should be able to format filled position data', () => {
    const position = Object.assign(new Position(asset, wallet), { id });
    new Operation(date, quantity, value, position);
    expect(positionView(position)).toEqual({
      id, asset, wallet: { name: walletName, owner: { name: investorName }},
      operations: [{
        date: date.toISOString(), quantity, value,
      }],
    });
  });
});
