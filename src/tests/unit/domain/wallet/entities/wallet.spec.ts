import Position from '@domain/wallet/entities/position';
import Wallet, { Investor } from '@domain/wallet/entities/wallet';

let name: string;
let owner: Investor;

describe('Wallet', () => {
  beforeAll(() => {
    name = 'Ações de crescimento',
    owner = {
      id: '0',
      name: 'Rafael Arantes',
    };
  });

  it('should be able to create empty wallet', () => {
    const wallet = new Wallet(name, owner);
    expect(wallet.name).toEqual(name);
    expect(wallet.owner).toEqual(owner);
    expect(wallet.getPositions().length).toBe(0);
  });

  it('should be able to add position', () => {
    const wallet = new Wallet(name, owner);
    wallet.addPosition(new Position({
      ticker: 'ITUB3',
      name: 'Itaú Unibanco Holding'
    }));
    expect(wallet.getPositions().length).toBe(1);
    expect(wallet.getPositions()[0]).toEqual(expect.objectContaining({
      asset: {
        ticker: 'ITUB3',
        name: 'Itaú Unibanco Holding',
      },
    }));
  });
});
