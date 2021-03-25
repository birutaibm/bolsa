import { PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { PositionLoader } from '@domain/wallet/usecases';

import { PositionLoaderController } from '@gateway/presentation/controllers';

let positionId: string;
let investorId: string;
let asset: { ticker: string; name: string; };
let owner: { id: string; name: string; };
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let positionLoader: PositionLoader;
let controller: PositionLoaderController;

describe('Position loader controller', () => {
  beforeAll(() => {
    positionId = 'positionId'
    authorization = 'Token ',
    investorId = 'myId';
    owner = { id: investorId, name: 'My Name' };
    asset = {name: 'Itaú Unibanco SA', ticker: 'ITUB3'};
    positionLoader = new PositionLoader((id, isLoggedUserId) => {
      if (id === 'Invalid id in db rules') {
        throw new Error("");
      } else if (id !== positionId) {
        throw new PositionNotFoundError(id);
      }
      if (!isLoggedUserId(owner.id)) {
        throw new SignInRequiredError();
      }
      return { id, wallet: { name: 'My Wallet', owner }, operations: [], asset };
    });
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    controller = new PositionLoaderController(
      positionLoader, new Authorization(() => loggedUser),
    );
  });

  it('should be able to load position', async done => {
    const params = {
      id: positionId,
      authorization,
    };
    const result = {
      id: positionId, asset, operations: [],
      wallet: {name: 'My Wallet', owner: {name: owner.name}},
    };
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 200, data: result});
    done();
  });

  it('should not be able to load position without authorization', async done => {
    const params = {
      id: positionId,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to load position without data', async done => {
    const params = {
      authorization,
    };
    const result = {message: 'Required parameters: id'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to load position with other user id', async done => {
    owner.id = 'notTheLoggedUserId';
    const params = {
      id: positionId,
      authorization,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    owner.id = investorId;
    done();
  });

  it('should not be able to load inexistent position', async done => {
    const params = {
      id: 'inexistentPositionId',
      authorization,
    };
    const result = {message: `Can't found position with id inexistentPositionId`};
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
