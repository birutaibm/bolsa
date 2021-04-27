import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { WalletLoader } from '@domain/wallet/usecases';

import { WalletLoaderController } from '@gateway/presentation/controllers';
import WalletModuleLoaders from '@mock/data-adapters/wallet-module-loaders';

let investorId: string;
let walletId: string;
let walletName: string;
let invalid: string;
let owner: { id: string; name: string; };
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let walletLoader: WalletLoader;
let controller: WalletLoaderController;

describe('Wallet loader controller', () => {
  beforeAll(() => {
    authorization = 'Token ';
    const loader = new WalletModuleLoaders();
    invalid = loader.invalidInDB;
    walletId = loader.wallet.id;
    walletName = loader.wallet.name;
    owner = loader.owner;
    investorId = owner.id;
    walletLoader = new WalletLoader(loader.loadWallet.bind(loader));
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    controller = new WalletLoaderController(
      walletLoader, new Authorization({verifyToken: () => loggedUser}),
    );
  });

  it('should be able to load wallet', async done => {
    const params = {
      id: walletId,
      authorization,
    };
    const result = expect.objectContaining({
      id: walletId, name: walletName, positions: expect.arrayContaining([]),
      owner: expect.objectContaining({name: owner.name}),
    });
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 200, data: result});
    done();
  });

  it('should not be able to load wallet without authorization', async done => {
    const params = {
      id: walletId,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to load wallet without data', async done => {
    const params = {
      authorization,
    };
    const result = {message: 'Required parameters: id'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to load wallet with other user id', async done => {
    owner.id = 'notTheLoggedUserId';
    const params = {
      id: walletId,
      authorization,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    owner.id = investorId;
    done();
  });

  it('should not be able to load inexistent wallet', async done => {
    const params = {
      id: 'inexistentWalletId',
      authorization,
    };
    const result = {message: 'Wallet inexistentWalletId not found'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 404, data: result});
    done();
  });

  it('should be able to repass unknown server error', async done => {
    const params = {
      id: invalid,
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
