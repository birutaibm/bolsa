import { Authorization } from '@domain/user/usecases';
import Creator, {
  LoadWalletData, PersistWalletData, WalletData
} from '@domain/wallet/usecases/create-operation';
import { OperationRegisterController } from '@gateway/presentation/controllers/operation-register';

let walletName: string;
let wallet: WalletData;
let owner: { id: string; name: string };
let asset: { ticker: string; name: string; };
let load: LoadWalletData;
let persist: PersistWalletData;
let creator: Creator;
let auth: Authorization;
let controller: OperationRegisterController;

describe('Operation register controller', () => {
  beforeAll(() => {
    walletName = 'old wallet'
    owner = { id:'', name: 'Rafael Arantes' };
    asset = {
      ticker: 'ITUB3',
      name: 'Itaú Unibanco Holding',
    },
    wallet = {
      name: walletName,
      owner,
      positions: [{
        asset,
        operations: []
      }],
    };
    load = (name) => wallet;
    persist = data => data;
    creator = new Creator(load, persist);
    auth = new Authorization(() => ({ id: owner.id, userName: owner.name, role: 'ADMIN' }));
    controller = new OperationRegisterController(creator, auth);
  });

  it('should be able to create operation', async done => {
    const wallet = await controller.handle({
      authorization: 'Token ',
      walletName,
      assetName: asset.name,
      ticker: asset.ticker,
      operationType: 'BUY',
      quantity: '100',
      value: '2345',
      date: new Date().toISOString(),
    })
    expect(wallet.statusCode).toBe(201);
    expect(wallet.data.name).toEqual(walletName);
    expect(wallet.data.owner).toEqual(owner);
    expect(wallet.data.positions.length).toBe(1);
    expect(wallet.data.positions[0].asset).toEqual(asset);
    expect(wallet.data.positions[0].operations.length).toBe(1);
    expect(Object.keys(wallet.data.positions[0].operations[0]).length).toBe(3);
    expect(wallet.data.positions[0].operations[0].date).toBeTruthy();
    expect(wallet.data.positions[0].operations[0]).toEqual(expect.objectContaining({
      quantity: 100,
      value: -2345,
    }));
    done();
  });

  it('should require login to create operation', async done => {
    const wallet = await controller.handle({
      authorization: '',
      walletName,
      assetName: asset.name,
      ticker: asset.ticker,
      operationType: 'BUY',
      quantity: '100',
      value: '2345',
      date: new Date().toISOString(),
    })
    expect(wallet.statusCode).toBe(401);
    expect(wallet.data.message).toEqual('Login required to this action!');
    done();
  });

  it('should validate operation type to create operation', async done => {
    const wallet = await controller.handle({
      authorization: 'Token ',
      walletName,
      assetName: asset.name,
      ticker: asset.ticker,
      quantity: '100',
      value: '2345',
      date: new Date().toISOString(),
    })
    expect(wallet.statusCode).toBe(400);
    expect(wallet.data.message).toEqual('Invalid operation type, use "BUY" or "SELL"');
    done();
  });

  it('should validate wallet name to create operation', async done => {
    const wallet = await controller.handle({
      authorization: 'Token ',
      assetName: asset.name,
      ticker: asset.ticker,
      operationType: 'BUY',
      quantity: '100',
      value: '2345',
      date: new Date().toISOString(),
    })
    expect(wallet.statusCode).toBe(400);
    expect(wallet.data.message).toEqual('Wallet name required!');
    done();
  });

  it('should validate quantity to create operation', async done => {
    const wallet = await controller.handle({
      authorization: 'Token ',
      walletName,
      assetName: asset.name,
      ticker: asset.ticker,
      operationType: 'BUY',
      value: '2345',
      date: new Date().toISOString(),
    })
    expect(wallet.statusCode).toBe(400);
    expect(wallet.data.message).toEqual('Quantity must be a number!');
    done();
  });

  it('should validate value to create operation', async done => {
    const wallet = await controller.handle({
      authorization: 'Token ',
      walletName,
      assetName: asset.name,
      ticker: asset.ticker,
      operationType: 'BUY',
      quantity: '100',
      value: 'ABC',
      date: new Date().toISOString(),
    })
    expect(wallet.statusCode).toBe(400);
    expect(wallet.data.message).toEqual('Value must be a number!');
    done();
  });

  it('should validate date to create operation', async done => {
    const wallet = await controller.handle({
      authorization: 'Token ',
      walletName,
      assetName: asset.name,
      ticker: asset.ticker,
      operationType: 'BUY',
      quantity: '100',
      value: '2345',
      date: '3/3/2021',
    })
    expect(wallet.statusCode).toBe(400);
    expect(wallet.data.message).toEqual('Date must be a valid date according to ISO-8601 format!');
    done();
  });

  it('should validate ticker to create operation', async done => {
    const wallet = await controller.handle({
      authorization: 'Token ',
      walletName,
      assetName: asset.name,
      operationType: 'BUY',
      quantity: '100',
      value: '2345',
      date: new Date().toISOString(),
    })
    expect(wallet.statusCode).toBe(400);
    expect(wallet.data.message).toEqual('Ticker required!');
    done();
  });

  it('should validate asset name to create operation', async done => {
    const wallet = await controller.handle({
      authorization: 'Token ',
      walletName,
      ticker: asset.ticker,
      operationType: 'BUY',
      quantity: '100',
      value: '2345',
      date: new Date().toISOString(),
    })
    expect(wallet.statusCode).toBe(400);
    expect(wallet.data.message).toEqual('Asset name required!');
    done();
  });

  it('should be able to repass server error', async done => {
    const creator = new Creator(load, () => {throw new Error("Server Error!!");});
    const controller = new OperationRegisterController(creator, auth);
    const wallet = await controller.handle({
      authorization: 'Token ',
      walletName,
      assetName: asset.name,
      ticker: asset.ticker,
      operationType: 'BUY',
      quantity: '100',
      value: '2345',
      date: new Date().toISOString(),
    })
    expect(wallet.statusCode).toBe(500);
    expect(wallet.data.message).toEqual('Server Error!!');
    done();
  });
});
