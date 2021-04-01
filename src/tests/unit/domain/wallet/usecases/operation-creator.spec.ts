import { PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';
import { Persisted } from '@utils/types';

import {
  PositionLoader, OperationCreator, PositionCreator, WalletLoader, WalletCreator
} from '@domain/wallet/usecases';
import { PopulatedPositionData } from '@domain/wallet/usecases/dtos';

let asset: { id: string; ticker: string; name: string; };
let opData: { id: string; date: Date; quantity: number; value: number; };
let positionData: Persisted<PopulatedPositionData>
let useCase: OperationCreator;

describe('Operation creator', () => {
  beforeAll(() => {
    asset = { id: 'assetId', ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    opData = { id: 'operationId', date: new Date(), quantity: 100, value: -2345 };
    const owner = { id: 'myID', name: 'My Name' };
    const wallet = { id: 'walletId', name: 'My Wallet', owner };
    const position = { id: 'positionId', wallet, asset};
    positionData = {
      ...position,
      operations: [{
        ...opData,
        position,
      }],
    };
    useCase = new OperationCreator(data => {
      if (!data.isLogged(positionData.wallet.owner.id))
        throw new SignInRequiredError();
      if ('positionId' in data) {
        if (positionData.id !== data.positionId)
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
  });

  it('should be able create operation', async done => {
    const operation = await useCase.create({
      date: opData.date,
      quantity: opData.quantity,
      value: opData.value,
      positionId: positionData.id,
      isLogged: () => true,
    });
    expect(operation).toEqual(expect.objectContaining(opData));
    done();
  });

  it('should not be able create operation without been logged', async done => {
    await expect(
      useCase.create({
        date: opData.date,
        quantity: opData.quantity,
        value: opData.value,
        positionId: positionData.id,
        isLogged: () => false,
      })
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able create operation for inexistent position', async done => {
    const id = 'nonInvestorId';
    await expect(
      useCase.create({
        date: opData.date,
        quantity: opData.quantity,
        value: opData.value,
        positionId: 'inexistentPosition',
        isLogged: () => true,
      })
    ).rejects.toBeInstanceOf(PositionNotFoundError);
    done();
  });
});
