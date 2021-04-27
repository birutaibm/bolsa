import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { InvestorLoader } from '@domain/wallet/usecases';

import { InvestorLoaderController } from '@gateway/presentation/controllers';

import WalletModuleLoaders from '@mock/data-adapters/wallet-module-loaders';

let id: string;
let name: string;
let invalidID: string;
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let useCase: InvestorLoader;
let controller: InvestorLoaderController;

describe('Investor loader controller', () => {
  beforeAll(() => {
    authorization = 'Token ';
    const loader = new WalletModuleLoaders();
    id = loader.owner.id;
    name = loader.owner.name;
    invalidID = loader.invalidInDB;
    useCase = new InvestorLoader(loader.loadInvestor.bind(loader));
    loggedUser = { id, userName: 'anybody', role: 'USER' };
    controller = new InvestorLoaderController(
      useCase,
      new Authorization({verifyToken:() => loggedUser}),
    );
  });

  it('should be able to load investor', async done => {
    const params = { id, authorization, };
    const result = { id, name, wallets: expect.arrayContaining([]) };
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 200, data: result});
    done();
  });

  it('should not be able to load investor without authorization', async done => {
    const params = { id };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to load investor without data', async done => {
    const params = { authorization };
    const result = {message: 'Required parameters: id'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to load investor with other user id', async done => {
    const params = { id: 'notTheLoggedUserId', authorization, };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to load inexistent investor', async done => {
    loggedUser.id = 'notInvestorUserId';
    const params = { id: loggedUser.id, authorization };
    const result = {message: `Investor ${loggedUser.id} not found`};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 404, data: result});
    loggedUser.id = id;
    done();
  });

  it('should be able to repass unknown server error', async done => {
    loggedUser.id = invalidID;
    const params = {
      id: loggedUser.id,
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    loggedUser.id = id;
    done();
  });
});
