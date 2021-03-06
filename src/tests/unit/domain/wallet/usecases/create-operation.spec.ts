import { WalletNotFoundError } from '@errors/wallet-not-found';
import Creator, {
  LoadWalletData, PersistWalletData, WalletData
} from '@domain/wallet/usecases/create-operation';

let wallets: {[name: string]: WalletData}
let owner: { id: string; name: string };
let asset: { ticker: string; name: string; };
let load: LoadWalletData;
let persist: PersistWalletData;

describe('Create operation use case', () => {
  beforeAll(() => {
    owner = { id: '0', name: 'Rafael Arantes' };
    asset = {
      ticker: 'ITUB3',
      name: 'Itaú Unibanco Holding',
    },
    wallets = {
      'old wallet': {
        name: 'old wallet',
        owner,
        positions: [{
          asset,
          operations: []
        }],
      }
    };
    load = (name) => {
      const wallet = wallets[name];
      if (wallet) return wallet;
      throw new WalletNotFoundError(name);
    }
    persist = data => data;
  });

  it('should be able to create wallet with buy operation', async done => {
    const creator = new Creator(load, persist);
    const wallet = await creator.create({
      wallet: 'new wallet',
      ownerName: owner.name,
      ownerId: owner.id,
      asset,
      operationType: 'BUY',
      quantity: 100,
      value: 2345,
    });
    expect(wallet.name).toEqual('new wallet');
    expect(wallet.owner).toEqual(owner);
    expect(wallet.positions.length).toBe(1);
    expect(wallet.positions[0].asset).toEqual(asset);
    expect(wallet.positions[0].operations.length).toBe(1);
    expect(Object.keys(wallet.positions[0].operations[0]).length).toBe(3);
    expect(wallet.positions[0].operations[0].date).toBeTruthy();
    expect(wallet.positions[0].operations[0]).toEqual(expect.objectContaining({
      quantity: 100,
      value: -2345,
    }));
    done();
  });

  it('should be able to create sell operation', async done => {
    const creator = new Creator(load, persist);
    const wallet = await creator.create({
      wallet: 'old wallet',
      ownerName: owner.name,
      ownerId: owner.id,
      asset,
      operationType: 'SELL',
      quantity: 100,
      value: 2345,
    });
    expect(wallet.name).toEqual('old wallet');
    expect(wallet.owner).toEqual(owner);
    expect(wallet.positions.length).toBe(1);
    expect(wallet.positions[0].asset).toEqual(asset);
    expect(wallet.positions[0].operations.length).toBe(1);
    expect(Object.keys(wallet.positions[0].operations[0]).length).toBe(3);
    expect(wallet.positions[0].operations[0].date).toBeTruthy();
    expect(wallet.positions[0].operations[0]).toEqual(expect.objectContaining({
      quantity: -100,
      value: 2345,
    }));
    done();
  });

  it('should be able to repass unknown errors', async done => {
    const error = new Error("Unknown");
    const load = () => {throw error};
    const creator = new Creator(load, persist);
    await expect(
      creator.create({
        wallet: 'old wallet',
        ownerName: owner.name,
        ownerId: owner.id,
        asset,
        operationType: 'SELL',
        quantity: 100,
        value: 2345,
      })
    ).rejects.toBe(error);
    done();
  });
});
