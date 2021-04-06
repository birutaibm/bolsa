import { Authorization } from '@domain/user/usecases';
import { InvestorCreator } from '@domain/wallet/usecases';

import { InvestorCreatorController } from '@gateway/presentation/controllers';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-saver';

let authorization: string;
let controller: InvestorCreatorController;

describe('Investor creator controller', () => {
  beforeAll(() => {
    authorization = 'Token ';
    const saver = new WalletModuleSavers();
    controller = new InvestorCreatorController(
      new InvestorCreator(saver.newInvestor.bind(saver)),
      new Authorization(() => ({id: 'myId', userName: 'anybody', role: 'USER' })),
    );
  });

  it('should be able to create investor', async done => {
    const params = {
      id: 'myId',
      name: 'My Name',
      authorization,
    };
    const result = {id: 'myId', name: 'My Name', wallets: []};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 201, data: result});
    done();
  });

  it('should not be able to create investor without authorization', async done => {
    const params = {
      id: 'myId',
      name: 'My Name',
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to create investor without data', async done => {
    const params = {
      id: 'myId',
      authorization,
    };
    const result = {message: 'Required parameters: id, name'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to create investor with other user id', async done => {
    const params = {
      id: 'notTheLoggedUserId',
      name: 'My Name',
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
      id: 'myId',
      name: 'Some reason invalid name in db rules',
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
