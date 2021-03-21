import { SignInRequiredError } from '@errors/sign-in-required';
import { WalletNotFoundError } from '@errors/not-found';

import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { PositionCreator, WalletLoader } from '@domain/wallet/usecases';

import { PositionCreatorController } from '@gateway/presentation/controllers';

let assetId: string;
let walletId: string;
let positionId: string;
let investorId: string;
let asset: { ticker: string; name: string; };
let owner: { id: string; name: string; };
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let walletLoader: WalletLoader;
let useCase: PositionCreator;
let controller: PositionCreatorController;

describe('Position creator controller', () => {
  beforeAll(() => {
    positionId = 'positionId';
    walletId = 'walletId';
    authorization = 'Token ';
    investorId = 'myId';
    owner = { id: investorId, name: 'My Name' };
    walletLoader = new WalletLoader((id, loggedUserId) => {
      if (id === 'Invalid id in db rules') {
        throw new Error("");
      } else if (id !== walletId) {
        throw new WalletNotFoundError(id);
      }
      if (owner.id !== loggedUserId) {
        throw new SignInRequiredError();
      }
      return { id, name: 'My Wallet', positions: [], owner };
    });
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    asset = {name: 'Itaú Unibanco SA', ticker: 'ITUB3'};
    assetId = 'assetId';
    useCase = new PositionCreator(
      () => positionId,
      walletLoader,
      {
        loadAssetDataById: () => asset,
      },
    );
    controller = new PositionCreatorController(
      useCase, new Authorization(() => loggedUser),
    );
  });

  it('should be able to create position', async done => {
    const params = {
      assetId,
      walletId,
      authorization,
    };
    const result = {
      id: positionId, asset, operations: [],
      wallet: {name: 'My Wallet', owner: {name: owner.name}},
    };
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 201, data: result});
    done();
  });

  it('should not be able to create position without authorization', async done => {
    const params = {
      assetId,
      walletId,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to create position without data', async done => {
    const params = {
      assetId,
      authorization,
    };
    const result = {message: 'Required parameters: assetId, walletId'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to create position with other user id', async done => {
    owner.id = 'notTheLoggedUserId';
    const params = {
      assetId,
      walletId,
      authorization,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    owner.id = investorId;
    done();
  });

  it('should be able to repass unknown server error', async done => {
    const params = {
      assetId,
      walletId: 'Invalid id in db rules',
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
