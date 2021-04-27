import { datatype, finance, date as fakeDate } from 'faker';

import { Authorization } from '@domain/user/usecases';
import { OperationCreator } from '@domain/wallet/usecases';

import { OperationCreatorController } from '@gateway/presentation/controllers';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-savers';

let date: string;
let quantity: string;
let value: string;
let operationId: string;
let positionId: string;
let investorId: string;
let walletName: string;
let asset: { id: string; ticker: string; name: string; };
let owner: { id: string; name: string; };
let authorization: string;
let controller: OperationCreatorController;
let invalid: string;

describe('Operation creator controller', () => {
  beforeAll(() => {
    const saver = new WalletModuleSavers();
    operationId = 'operationId';
    date = fakeDate.recent().toISOString();
    quantity = datatype.number().toString();
    value = `-${finance.amount()}`;
    positionId = saver.position.id;
    authorization = 'Token ';
    investorId = saver.owner.id;
    owner = saver.owner;
    walletName = saver.wallet.name;
    asset = saver.asset;
    invalid = saver.invalidInDB;
    controller = new OperationCreatorController(
      new OperationCreator(saver.newOperation.bind(saver)),
      new Authorization({verifyToken: () => (
        { id: investorId, userName: 'anybody', role: 'USER' }
      )}),
    );
  });

  it('should be able to create operation', async done => {
    const params = {
      date,
      quantity,
      value,
      positionId,
      authorization,
    };
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 201, data: expect.objectContaining({
      id: operationId, date, quantity: Number(quantity), value: Number(value),
      position: expect.objectContaining({
        asset, wallet: expect.objectContaining({
          name: walletName, owner: expect.objectContaining({name: owner.name})
        }),
      }),
    })});
    done();
  });

  it('should not be able to create operation without authorization', async done => {
    const params = {
      date,
      quantity,
      value,
      positionId,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to create operation without data', async done => {
    const params = {
      date,
      quantity,
      positionId,
      authorization,
    };
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: {message: expect.stringContaining(
        'Required parameters: date, quantity, value'
    )}});
    done();
  });

  it('should not be able to create operation with wrong date', async done => {
    const params = {
      date: '2/3/2021',
      value,
      quantity,
      positionId,
      authorization,
    };
    const result = {message: 'Date must be in ISO format'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to create operation with wrong quantity', async done => {
    const params = {
      date,
      value,
      quantity: 'All of it',
      positionId,
      authorization,
    };
    const result = {message: 'Quantity and value must be cast to valid numbers'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to create operation with same sign quantity and value', async done => {
    const params = {
      date,
      value,
      quantity: '-100',
      positionId,
      authorization,
    };
    const result = {message: 'Quantity and value must be opposite signal numbers'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to create operation with other user id', async done => {
    owner.id = 'notTheLoggedUserId';
    const params = {
      date,
      quantity,
      value,
      positionId,
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
      date,
      quantity,
      value,
      positionId: invalid,
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
