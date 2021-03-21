import { PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { PositionLoader, OperationCreator } from '@domain/wallet/usecases';
import { Persisted, PopulatedPositionData } from '@domain/wallet/usecases/dtos';

let asset: { ticker: string; name: string; };
let opData: { date: Date; quantity: number; value: number; };
let positionData: Persisted<PopulatedPositionData>
let useCase: OperationCreator;

describe('Operation creator', () => {
  beforeAll(() => {
    asset = { ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    opData = { date: new Date(), quantity: 100, value: -2345 };
    const owner = { id: 'myID', name: 'My Name' };
    const wallet = { id: 'walletId', name: 'My Wallet', owner };
    const position = { id: 'positionId', wallet, asset};
    positionData = {
      ...position,
      id: 'positionId',
      operations: [{
        ...opData,
        position,
      }],
    }
    const positionLoader = new PositionLoader((id, loggedUserId) => {
      if (id === positionData.id) {
        if (positionData.wallet.owner.id === loggedUserId) return positionData;
        throw new SignInRequiredError();
      }
      throw new PositionNotFoundError(id);
    });
    useCase = new OperationCreator(
      () => 'operationId',
      positionLoader,
    );
  });

  it('should be able create operation', async done => {
    const operation = await useCase.create(
      opData.date,
      opData.quantity,
      opData.value,
      positionData.id,
      positionData.wallet.owner.id
    );
    expect(operation).toEqual(expect.objectContaining(opData));
    done();
  });

  it('should not be able create operation without been logged', async done => {
    await expect(
      useCase.create(
        opData.date,
        opData.quantity,
        opData.value,
        positionData.id,
        'hackerID',
      )
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able create operation for inexistent position', async done => {
    const id = 'nonInvestorId';
    await expect(
      useCase.create(
        opData.date,
        opData.quantity,
        opData.value,
        'inexistentPosition',
        positionData.wallet.owner.id
      )
    ).rejects.toBeInstanceOf(PositionNotFoundError);
    done();
  });
});
