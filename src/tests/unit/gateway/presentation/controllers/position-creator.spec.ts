import { Authorization } from '@domain/user/usecases';
import { PositionCreator } from '@domain/wallet/usecases';

import { PositionCreatorController } from '@gateway/presentation/controllers';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-saver';

let assetId: string;
let walletId: string;
let investorId: string;
let asset: { id: string; ticker: string; name: string; };
let owner: { id: string; name: string; };
let authorization: string;
let controller: PositionCreatorController;

describe('Position creator controller', () => {
  beforeAll(() => {
    const saver = new WalletModuleSavers();
    walletId = saver.wallet.id;
    authorization = 'Token ';
    investorId = saver.owner.id;
    owner = saver.owner;
    asset = saver.asset;
    assetId = asset.id;
    controller = new PositionCreatorController(
      new PositionCreator(saver.newPosition.bind(saver)),
      new Authorization(() => (
        { id: investorId, userName: 'anybody', role: 'USER' }
      )),
    );
  });

  it('should be able to create position', async done => {
    const params = {
      assetId,
      walletId,
      authorization,
    };
    const result = expect.objectContaining({
      asset, operations: [],
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
