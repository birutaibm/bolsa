import { PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';
import { Persisted } from '@utils/types';

import { PositionLoader } from '@domain/wallet/usecases';
import { PopulatedPositionData } from '@domain/wallet/usecases/dtos';

let asset: { id: string; ticker: string; name: string; };
let opData: { id: string; date: Date; quantity: number; value: number; };
let data: Persisted<PopulatedPositionData>;
let useCase: PositionLoader;

describe('Position loader', () => {
  beforeAll(() => {
    asset = { id: 'assetId', ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    opData = { id: 'operationId', date: new Date(), quantity: 100, value: -2345 };
    const owner = { id: 'myID', name: 'My Name' };
    const wallet = { id: 'walletId', name: 'My Wallet', owner };
    const position = { id: 'positionId', wallet, asset};
    data = {
      id: 'positionId',
      wallet,
      asset,
      operations: [{
        ...opData,
        position,
      }],
    };
    useCase = new PositionLoader((id, isLogged) => {
      if (id === data.id) {
        if (isLogged(data.wallet.owner.id)) return data;
        throw new SignInRequiredError();
      }
      throw new PositionNotFoundError(id);
    });
  });

  it('should be able to load position', async done => {
    const position = await useCase.load(data.id, () => true);
    expect(position.asset).toEqual(expect.objectContaining(asset));
    expect(position.getOperations()[0]).toEqual(expect.objectContaining(opData));
    done();
  });

  it('should not be able to load position without been logged', async done => {
    await expect(
      useCase.load(data.id, () => false)
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able to load inexistent position', async done => {
    await expect(
      useCase.load('invalidID', () => true)
    ).rejects.toBeInstanceOf(PositionNotFoundError);
    done();
  });
});
