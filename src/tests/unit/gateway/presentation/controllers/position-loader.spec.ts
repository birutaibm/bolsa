import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { PositionLoader } from '@domain/wallet/usecases';

import { PositionLoaderController } from '@gateway/presentation/controllers';

import WalletModuleLoaders from '@mock/data-adapters/wallet-module-loaders';

let positionId: string;
let investorId: string;
let walletName: string;
let invalid: string;
let asset: { id: string; ticker: string; name: string; };
let owner: { id: string; name: string; };
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let positionLoader: PositionLoader;
let controller: PositionLoaderController;

describe('Position loader controller', () => {
  beforeAll(() => {
    const loader = new WalletModuleLoaders();
    positionId = loader.position.id;
    owner = loader.owner;
    asset = loader.asset;
    walletName = loader.wallet.name;
    invalid = loader.invalidInDB;
    authorization = 'Token ',
    investorId = owner.id;
    positionLoader = new PositionLoader(loader.loadPosition.bind(loader));
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    controller = new PositionLoaderController(
      positionLoader, new Authorization({verifyToken: () => loggedUser}),
    );
  });

  it('should be able to load position', async done => {
    const params = {
      id: positionId,
      authorization,
    };
    const result = expect.objectContaining({
      id: positionId, asset,
      wallet: expect.objectContaining({
        name: walletName, owner: expect.objectContaining({name: owner.name})
      }),
    });
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
    const result = {message: 'Position inexistentPositionId not found'};
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
