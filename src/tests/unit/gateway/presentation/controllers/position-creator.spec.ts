import { SignInRequiredError } from '@errors/sign-in-required';
import { WalletNotFoundError } from '@errors/not-found';

import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { InvestorCreator, InvestorLoader, PositionCreator, WalletCreator, WalletLoader } from '@domain/wallet/usecases';

import { PositionCreatorController } from '@gateway/presentation/controllers';

let assetId: string;
let walletId: string;
let positionId: string;
let investorId: string;
let asset: { id: string; ticker: string; name: string; };
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
    walletLoader = new WalletLoader((id, isLoggedUserId) => {
      if (id === 'Invalid id in db rules') {
        throw new Error("");
      } else if (id !== walletId) {
        throw new WalletNotFoundError(id);
      }
      if (!isLoggedUserId(owner.id)) {
        throw new SignInRequiredError();
      }
      return { id, name: 'My Wallet', positions: [], owner };
    });
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    asset = {id: 'assetId', name: 'Itaú Unibanco SA', ticker: 'ITUB3'};
    assetId = 'assetId';
    const walletCreator = new WalletCreator(
      () => {throw new Error()},
      new InvestorLoader(() => {throw new Error()}),
      new InvestorCreator(() => {throw new Error()}),
    );
    useCase = new PositionCreator(
      () => positionId,
      { loadAssetDataById: () => asset },
      walletLoader,
      walletCreator,
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
    const result = expect.objectContaining({
      id: positionId, asset, operations: [],
      wallet: expect.objectContaining({
        name: 'My Wallet', owner: expect.objectContaining({name: owner.name})
      }),
    });
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
