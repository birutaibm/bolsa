import { OperationNotFoundError, PositionNotFoundError, WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { OperationLoader, WalletLoader } from '@domain/wallet/usecases';

import { OperationLoaderController } from '@gateway/presentation/controllers';

let date: Date;
let quantity: number;
let value: number;
let operationId: string;
let positionId: string;
let investorId: string;
let asset: { ticker: string; name: string; };
let owner: { id: string; name: string; };
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let operationLoader: OperationLoader;
let controller: OperationLoaderController;

describe('Position loader controller', () => {
  beforeAll(() => {
    date = new Date();
    quantity = 100;
    value = -2345;
    operationId = 'operationId';
    positionId = 'positionId'
    authorization = 'Token ',
    investorId = 'myId';
    owner = { id: investorId, name: 'My Name' };
    asset = {name: 'Itaú Unibanco SA', ticker: 'ITUB3'};
    operationLoader = new OperationLoader((id, loggedUserId) => {
      if (id === 'Invalid id in db rules') {
        throw new Error("");
      } else if (id !== operationId) {
        throw new OperationNotFoundError(id);
      }
      if (owner.id !== loggedUserId) {
        throw new SignInRequiredError();
      }
      return {
        id, date, quantity, value, position: {
          id: positionId, wallet: { name: 'My Wallet', owner }, asset}
      };
    });
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    controller = new OperationLoaderController(
      operationLoader, new Authorization(() => loggedUser),
    );
  });

  it('should be able to load operation', async done => {
    const params = {
      id: operationId,
      authorization,
    };
    const result = {
      id: operationId, date: date.toISOString(), quantity, value, position: {
        asset, wallet: {name: 'My Wallet', owner: {name: owner.name}},
      },
    };
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
    const result = {message: `Can't found operation with id inexistentOperationId`};
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
