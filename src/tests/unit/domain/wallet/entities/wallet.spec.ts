import { datatype, finance, name as user } from 'faker';

import { Investor, Wallet } from '@domain/wallet/entities';

let name: string;
let owner: Investor;

describe('Wallet', () => {
  beforeAll(() => {
    name = finance.accountName();
    owner = new Investor(datatype.uuid(), user.findName());
  });

  it('should be able to create empty wallet', () => {
    const wallet = new Wallet('id', name, owner);
    expect(wallet.name).toEqual(name);
    expect(wallet.owner).toEqual(owner);
    expect(wallet.getPositions().length).toBe(0);
  });
});
