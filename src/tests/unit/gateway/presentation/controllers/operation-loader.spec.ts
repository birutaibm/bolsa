import { OperationNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { OperationLoader, WalletLoader } from '@domain/wallet/usecases';

import { OperationLoaderController } from '@gateway/presentation/controllers';
import WalletModuleLoaders from '@mock/data-adapters/wallet-module-loaders';

let date: Date;
let quantity: number;
let value: number;
let operationId: string;
let investorId: string;
let walletName: string;
let asset: { id: string; ticker: string; name: string; };
let owner: { id: string; name: string; };
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let invalid: string;
let operationLoader: OperationLoader;
let controller: OperationLoaderController;

describe('Operation loader controller', () => {
  beforeAll(() => {
    const loader = new WalletModuleLoaders();
    const {operation} = loader;
    date = operation.date;
    quantity = operation.quantity;
    value = operation.value;
    operationId = operation.id;
    authorization = 'Token ',
    owner = loader.owner;
    investorId = owner.id;
    asset = loader.asset;
    invalid = loader.invalidInDB;
    walletName = loader.wallet.name;
    operationLoader = new OperationLoader(loader.loadOperation.bind(loader));
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    controller = new OperationLoaderController(
      operationLoader, new Authorization({verifyToken: () => loggedUser}),
    );
  });

  it('should be able to load operation', async done => {
    const params = {
      id: operationId,
      authorization,
    };
    const result = expect.objectContaining({
      id: operationId, date: date.toISOString(), quantity, value,
      position: expect.objectContaining({
        asset, wallet: expect.objectContaining({
          name: walletName, owner: expect.objectContaining({name: owner.name})
        }),
      }),
    });
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 200, data: result});
    done();
  });

  it('should not be able to load operation without authorization', async done => {
    const params = {
      id: operationId,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to load operation without data', async done => {
    const params = {
      authorization,
    };
    const result = {message: 'Required parameters: id'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to load operation with other user id', async done => {
    owner.id = 'notTheLoggedUserId';
    const params = {
      id: operationId,
      authorization,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    owner.id = investorId;
    done();
  });

  it('should not be able to load inexistent operation', async done => {
    const params = {
      id: 'inexistentOperationId',
      authorization,
    };
    const result = {message: 'Operation inexistentOperationId not found'};
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
