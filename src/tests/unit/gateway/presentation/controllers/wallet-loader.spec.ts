import { WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { WalletLoader } from '@domain/wallet/usecases';

import { WalletLoaderController } from '@gateway/presentation/controllers';

let walletId: string;
let investorId: string;
let owner: { id: string; name: string; };
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let walletLoader: WalletLoader;
let controller: WalletLoaderController;

describe('Wallet loader controller', () => {
  beforeAll(() => {
    walletId = 'walletId'
    authorization = 'Token ',
    investorId = 'myId';
    owner = { id: investorId, name: 'My Name' };
    walletLoader = new WalletLoader((id, isLogged) => {
      if (id === 'Invalid id in db rules') {
        throw new Error("");
      } else if (id !== walletId) {
        throw new WalletNotFoundError(id);
      }
      if (!isLogged(owner.id)) {
        throw new SignInRequiredError();
      }
      return { id, name: 'My Wallet', positions: [], owner };
    });
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    controller = new WalletLoaderController(
      walletLoader, new Authorization(() => loggedUser),
    );
  });

  it('should be able to load wallet', async done => {
    const params = {
      id: walletId,
      authorization,
    };
    const result = expect.objectContaining({
      id: walletId, name: 'My Wallet', positions: [],
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
    const result = {message: `Can't found wallet with id inexistentWalletId`};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 404, data: result});
    done();
  });

  it('should be able to repass unknown server error', async done => {
    const params = {
      id: 'Invalid id in db rules',
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
