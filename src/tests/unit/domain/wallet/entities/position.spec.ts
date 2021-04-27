import Wallet from '@domain/wallet/entities/wallet';
import Position, { Asset } from '@domain/wallet/entities/position';
import { Investor } from '@domain/wallet/entities';
import { Persisted } from '@utils/types';
import { datatype, finance, name } from 'faker';

let asset: Persisted<Asset>;
let wallet: Persisted<Wallet>;

describe('Wallet position', () => {
  beforeAll(() => {
    asset = {
      id: datatype.uuid(),
      ticker: datatype.string(5),
      name: finance.accountName(),
    };
    wallet = new Wallet(
      datatype.uuid(), finance.accountName(), new Investor(
        datatype.uuid(), name.findName()
      )
    );
  });

  it('should be able to create empty position', () => {
    const position = new Position('id', asset, wallet);
    expect(position.asset).toEqual(asset);
    expect(position.getOperations().length).toBe(0);
  });
});
