import { InvestorNotFoundError } from '@errors/not-found';

import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { InvestorLoader, WalletCreator } from '@domain/wallet/usecases';

import { WalletCreatorController } from '@gateway/presentation/controllers';

let walletId: string;
let investorId: string;
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let investorLoader: InvestorLoader;
let controller: WalletCreatorController;

describe('Wallet creator controller', () => {
  beforeAll(() => {
    walletId = 'walletId'
    authorization = 'Token ',
    investorId = 'myId';
    investorLoader = new InvestorLoader(id => {
      if (id === 'Invalid id in db rules') {
        throw new Error("");
      } else if (id === investorId) {
        return {id, name: 'My Name', wallets: []};
      }
      throw new InvestorNotFoundError(id);
    });
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    controller = new WalletCreatorController(
      new WalletCreator((name) => {
        if (name === 'Invalid name in db rules') {
          throw new Error("");
        }
        return walletId;
      }, investorLoader),
      new Authorization(() => loggedUser),
    );
  });

  it('should be able to create wallet', async done => {
    const params = {
      name: 'My Wallet',
      investorId,
      authorization,
    };
    const result = {
      id: walletId, name: 'My Wallet', owner: {name: 'My Name'}, positions: [],
    };
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 201, data: result});
    done();
  });

  it('should not be able to create wallet without authorization', async done => {
    const params = {
      name: 'My Wallet',
      investorId,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to create wallet without data', async done => {
    const params = {
      investorId,
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
      investorId,
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
