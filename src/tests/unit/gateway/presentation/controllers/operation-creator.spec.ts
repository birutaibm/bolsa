import { SignInRequiredError } from '@errors/sign-in-required';
import { PositionNotFoundError } from '@errors/not-found';

import { Authorization } from '@domain/user/usecases';
import { OperationCreator } from '@domain/wallet/usecases';

import { OperationCreatorController } from '@gateway/presentation/controllers';

let date: string;
let quantity: string;
let value: string;
let operationId: string;
let positionId: string;
let investorId: string;
let asset: { id: string; ticker: string; name: string; };
let owner: { id: string; name: string; };
let authorization: string;
let controller: OperationCreatorController;

describe('Operation creator controller', () => {
  beforeAll(() => {
    operationId = 'operationId';
    date = new Date().toISOString();
    quantity = '100';
    value = '-2345';
    positionId = 'positionId';
    authorization = 'Token ';
    investorId = 'myId';
    owner = { id: investorId, name: 'Investor Name' };
    const wallet = { id: 'walletId', name: 'My Wallet', owner };
    asset = {id: 'assetId', name: 'Itaú Unibanco SA', ticker: 'ITUB3'};
    const position = { id: 'positionId', wallet, asset};
    const positionData = {
      ...position,
      operations: [{
        date, quantity, value, id: operationId,
        position,
      }],
    };
    const useCase = new OperationCreator(data => {
      if (!data.isLogged(positionData.wallet.owner.id))
        throw new SignInRequiredError();
      if ('positionId' in data) {
        if (data.positionId === 'Invalid id in db rules')
          throw new Error("");
        else if (positionData.id !== data.positionId)
          throw new PositionNotFoundError(data.positionId);
        return {
          id: 'operationId', position: positionData,
          date: data.date, quantity: data.quantity, value: data.value,
        };
      }
      return {
        id: 'operationId', position: positionData,
        date: data.date, quantity: data.quantity, value: data.value,
      };
    });
    controller = new OperationCreatorController(
      useCase, new Authorization(() => (
        { id: investorId, userName: 'anybody', role: 'USER' }
      )),
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
      id: operationId, date, quantity: 100, value: -2345,
      position: expect.objectContaining({
        asset, wallet: expect.objectContaining({
          name: 'My Wallet', owner: expect.objectContaining({name: owner.name})
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
    const result = {message: 'Required parameters: date, quantity, value'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
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
      positionId: 'Invalid id in db rules',
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
