import Wallet from '@domain/wallet/entities/wallet';
import Position, { Asset } from '@domain/wallet/entities/position';
import { Investor } from '@domain/wallet/entities';
import { Persisted } from '@utils/types';

let asset: Persisted<Asset>;
let wallet: Persisted<Wallet>;

describe('Wallet position', () => {
  beforeAll(() => {
    asset = {
      id: 'assetId',
      ticker: 'ITUB3',
      name: 'Itaú Unibanco Holding',
    };
    wallet = new Wallet(
      'walletId', 'My wallet', new Investor('0', 'Rafael Arantes')
    );
  });

  it('should be able to create empty position', () => {
    const position = new Position('id', asset, wallet);
    expect(position.asset).toEqual(asset);
    expect(position.getOperations().length).toBe(0);
  });
});
