import { company } from 'faker';

import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { WalletCreator } from '@domain/wallet/usecases';

import { WalletCreatorController } from '@gateway/presentation/controllers';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-savers';

let investor: { id: string; name: string; };
let loggedUser: { id: string; role: Role; userName: string; };
let name: string;
let authorization: string;
let controller: WalletCreatorController;
let invalidName: string;

describe('Wallet creator controller', () => {
  beforeAll(() => {
    const saver = new WalletModuleSavers();
    authorization = 'Token ',
    name = company.companyName();
    investor = saver.owner;
    invalidName = saver.invalidInDB;
    loggedUser = { id: investor.id, userName: 'anybody', role: 'USER' };
    controller = new WalletCreatorController(
      new WalletCreator(saver.newWallet.bind(saver)),
      new Authorization({verifyToken: () => loggedUser}),
    );
  });

  it('should be able to create wallet', async done => {
    const params = { name, investorId: investor.id, authorization };
    const result = expect.objectContaining({
      name, positions: [],
      owner: expect.objectContaining(investor),
    });
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 201, data: result});
    done();
  });

  it('should not be able to create wallet without authorization', async done => {
    const params = { name, investorId: investor.id };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to create wallet without data', async done => {
    const params = { investorId: investor.id, authorization };
    const result = {message: 'Required parameters: investorId, name'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to create wallet with other user id', async done => {
    const params = { name, investorId: 'notTheLoggedUserId', authorization };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should be able to repass unknown server error', async done => {
    const params = {
      name: invalidName,
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
