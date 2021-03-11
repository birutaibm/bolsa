import { Investor, Wallet } from '@domain/wallet/entities';

let name: string;
let owner: Investor;

describe('Wallet', () => {
  beforeAll(() => {
    name = 'Ações de crescimento';
    owner = new Investor('0', 'Rafael Arantes');
  });

  it('should be able to create empty wallet', () => {
    const wallet = new Wallet(name, owner);
    expect(wallet.name).toEqual(name);
    expect(wallet.owner).toEqual(owner);
    expect(wallet.getPositions().length).toBe(0);
  });
});
