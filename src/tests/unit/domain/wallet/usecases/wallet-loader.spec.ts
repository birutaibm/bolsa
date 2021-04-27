import { WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';
import { Persisted } from '@utils/types';

import { WalletLoader } from '@domain/wallet/usecases';
import { PopulatedWalletData } from '@domain/wallet/usecases/dtos';

import WalletModuleLoaders from '@mock/data-adapters/wallet-module-loaders';

let asset: { id: string; ticker: string; name: string; };
let opData: { id: string; date: Date; quantity: number; value: number; };
let data: Persisted<PopulatedWalletData>;
let useCase: WalletLoader;

describe('Wallet loader', () => {
  beforeAll(() => {
    const loader = new WalletModuleLoaders();
    asset = loader.asset;
    const { id, date, quantity, value } = loader.operation;
    opData = { id, date, quantity, value };
    const { wallet, position} = loader;
    data = {
      ...wallet,
      positions: [{
        ...position,
        operations: [{
          ...opData,
          position,
        }],
      }],
    };
    useCase = new WalletLoader(loader.loadWallet.bind(loader));
  });

  it('should be able to load wallet', async done => {
    const wallet = await useCase.load(data.id, () => true);
    expect(wallet.name).toEqual(data.name);
    expect(wallet.owner).toEqual(expect.objectContaining(data.owner));
    const position = wallet.getPositions()[0];
    expect(position.asset).toEqual(expect.objectContaining(asset));
    expect(position.getOperations()[0]).toEqual(expect.objectContaining(opData));
    done();
  });

  it('should not be able to load wallet without been logged', async done => {
    await expect(
      useCase.load(data.id, () => false)
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able to load inexistent wallet', async done => {
    await expect(
      useCase.load('invalidID', () => true)
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    done();
  });
});
