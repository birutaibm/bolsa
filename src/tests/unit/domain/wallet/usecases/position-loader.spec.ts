import { PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';
import { Persisted } from '@utils/types';

import { PositionLoader } from '@domain/wallet/usecases';
import { PopulatedPositionData } from '@domain/wallet/usecases/dtos';

import WalletModuleLoaders from '@mock/data-adapters/wallet-module-loaders';

let asset: { id: string; ticker: string; name: string; };
let opData: { id: string; date: Date; quantity: number; value: number; };
let data: Persisted<PopulatedPositionData>;
let useCase: PositionLoader;

describe('Position loader', () => {
  beforeAll(() => {
    const loader = new WalletModuleLoaders();
    asset = loader.asset;
    const { id, date, quantity, value } = loader.operation;
    opData = { id, date, quantity, value };
    const { position } = loader;
    data = {
      ...position,
      operations: [{
        ...opData,
        position,
      }],
    };
    useCase = new PositionLoader(loader.loadPosition.bind(loader));
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
