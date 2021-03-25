import { PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { OperationLoader } from '@domain/wallet/usecases';
import { OperationData, Persisted } from '@domain/wallet/usecases/dtos';

let asset: { ticker: string; name: string; };
let opData: { date: Date; quantity: number; value: number; };
let data: Persisted<OperationData>;
let useCase: OperationLoader;

describe('Operation loader', () => {
  beforeAll(() => {
    asset = { ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    opData = { date: new Date(), quantity: 100, value: -2345 };
    const owner = { id: 'myID', name: 'My Name' };
    const wallet = { id: 'walletId', name: 'My Wallet', owner };
    const position = { id: 'positionId', wallet, asset};
    data = {
      ...opData,
      id: 'operationId',
      position,
    };
    useCase = new OperationLoader((id, isLoggedUserId) => {
      if (id === data.id) {
        if (isLoggedUserId(data.position.wallet.owner.id)) return data;
        throw new SignInRequiredError();
      }
      throw new PositionNotFoundError(id);
    });
  });

  it('should be able to load operation', async done => {
    const operation = await useCase.load(data.id, () => true);
    expect(operation).toEqual(expect.objectContaining(opData));
    done();
  });

  it('should not be able to load operation without been logged', async done => {
    await expect(
      useCase.load(data.id, () => false)
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able to load inexistent operation', async done => {
    await expect(
      useCase.load('invalidID', () => true)
    ).rejects.toBeInstanceOf(PositionNotFoundError);
    done();
  });
});
