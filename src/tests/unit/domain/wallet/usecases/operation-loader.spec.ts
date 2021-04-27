import { OperationNotFoundError, PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { OperationLoader } from '@domain/wallet/usecases';

import WalletModuleLoaders from '@mock/data-adapters/wallet-module-loaders';

let asset: { id: string; ticker: string; name: string; };
let opData: { date: Date; quantity: number; value: number; };
let id: string;
let useCase: OperationLoader;

describe('Operation loader', () => {
  beforeAll(() => {
    const loader = new WalletModuleLoaders();
    asset = loader.asset;
    id = loader.operation.id;
    const { date, quantity, value } = loader.operation;
    opData = { date, quantity, value };
    useCase = new OperationLoader(loader.loadOperation.bind(loader));
  });

  it('should be able to load operation', async done => {
    const operation = await useCase.load(id, () => true);
    expect(operation).toEqual(expect.objectContaining(opData));
    done();
  });

  it('should not be able to load operation without been logged', async done => {
    await expect(
      useCase.load(id, () => false)
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able to load inexistent operation', async done => {
    await expect(
      useCase.load('invalidID', () => true)
    ).rejects.toBeInstanceOf(OperationNotFoundError);
    done();
  });
});
