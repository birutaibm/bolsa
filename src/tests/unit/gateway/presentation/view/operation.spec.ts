import { Asset, Investor, Operation, Position, Wallet } from '@domain/wallet/entities';
import { operationView } from '@gateway/presentation/view/operation';

let id: string;
let walletName: string;
let investorId: string;
let investorName: string;
let owner: Investor;
let asset: Asset;
let position: Position;
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
    asset = { ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    position = new Position(asset, new Wallet(walletName, owner));
    date = new Date();
    quantity = 100;
    value = -2345;
  });

  it('should be able to format operation data', () => {
    const operation = Object.assign(
      new Operation(date, quantity, value, position),
      { id },
    );
    expect(operationView(operation)).toEqual({
      id, date: date.toISOString(), quantity, value, position: {
        asset, wallet: { name: walletName, owner: { name: investorName }},
      },
    });
  });
});
