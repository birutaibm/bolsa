import { WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';
import { Persisted } from '@utils/types';

import { WalletLoader } from '@domain/wallet/usecases';
import { PopulatedWalletData } from '@domain/wallet/usecases/dtos';

let asset: { ticker: string; name: string; };
let opData: { date: Date; quantity: number; value: number; };
let data: Persisted<PopulatedWalletData>;
let useCase: WalletLoader;

describe('Wallet loader', () => {
  beforeAll(() => {
    asset = { ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    opData = { date: new Date(), quantity: 100, value: -2345 };
    const owner = { id: 'myID', name: 'My Name' };
    const wallet = { id: 'walletId', name: 'My Wallet', owner };
    const position = { id: 'positionId', wallet, asset};
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
    useCase = new WalletLoader((id, isLogged) => {
      if (id === data.id) {
        if (isLogged(data.owner.id)) return data;
        throw new SignInRequiredError();
      }
      throw new WalletNotFoundError(id);
    });
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
