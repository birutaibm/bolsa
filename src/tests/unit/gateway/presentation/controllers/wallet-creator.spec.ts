import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { WalletCreator } from '@domain/wallet/usecases';

import { WalletCreatorController } from '@gateway/presentation/controllers';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-saver';

let investor: { id: string; name: string; };
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let controller: WalletCreatorController;

describe('Wallet creator controller', () => {
  beforeAll(() => {
    const saver = new WalletModuleSavers();
    authorization = 'Token ',
    investor = saver.owner;
    loggedUser = { id: investor.id, userName: 'anybody', role: 'USER' };
    controller = new WalletCreatorController(
      new WalletCreator(saver.newWallet.bind(saver)),
      new Authorization(() => loggedUser),
    );
  });

  it('should be able to create wallet', async done => {
    const params = {
      name: 'My Wallet',
      investorId: investor.id,
      authorization,
    };
    const result = expect.objectContaining({
      name: 'My Wallet', positions: [],
      owner: expect.objectContaining(investor),
    });
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 201, data: result});
    done();
  });

  it('should not be able to create wallet without authorization', async done => {
    const params = {
      name: 'My Wallet',
      investorId: investor.id,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to create wallet without data', async done => {
    const params = {
      investorId: investor.id,
      authorization,
    };
    const result = {message: 'Required parameters: investorId, name'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to create wallet with other user id', async done => {
    const params = {
      name: 'My Wallet',
      investorId: 'notTheLoggedUserId',
      authorization,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should be able to repass unknown server error', async done => {
    const params = {
      name: 'Invalid name in db rules',
      investorId: investor.id,
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
