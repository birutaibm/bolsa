import { datatype, name as user } from 'faker';

import { Authorization } from '@domain/user/usecases';
import { InvestorCreator } from '@domain/wallet/usecases';

import { InvestorCreatorController } from '@gateway/presentation/controllers';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-savers';

let authorization: string;
let controller: InvestorCreatorController;
let id: string;
let name: string;
let invalidName: string;

describe('Investor creator controller', () => {
  beforeAll(() => {
    authorization = 'Token ';
    id = datatype.hexaDecimal(24);
    name = user.findName();
    const saver = new WalletModuleSavers();
    invalidName = saver.invalidInDB;
    controller = new InvestorCreatorController(
      new InvestorCreator(saver.newInvestor.bind(saver)),
      new Authorization({verifyToken: () => (
        {id, userName: 'anybody', role: 'USER' }
      )}),
    );
  });

  it('should be able to create investor', async done => {
    const params = { id, name, authorization, };
    const result = {id, name, wallets: []};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 201, data: result});
    done();
  });

  it('should not be able to create investor without authorization', async done => {
    const params = { id, name, };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to create investor without data', async done => {
    const params = { id, authorization, };
    const result = {message: 'Required parameters: id, name'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to create investor with other user id', async done => {
    const params = { id: 'notTheLoggedUserId', name, authorization, };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should be able to repass unknown server error', async done => {
    const params = { id, authorization, name: invalidName, };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
