import { WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';
import { Persisted } from '@utils/types';

import { WalletLoader, PositionCreator } from '@domain/wallet/usecases';
import { AssetData, PopulatedWalletData } from '@domain/wallet/usecases/dtos';

let walletData: Persisted<PopulatedWalletData>;
let useCase: PositionCreator;
let asset: Persisted<AssetData>;

describe('Position creator', () => {
  beforeAll(() => {
    asset = { id: 'assetId', ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    const owner = { id: 'myID', name: 'My Name' };
    const wallet = { name: 'My Wallet', owner };
    walletData = {
      id: 'walletId',
      ...wallet,
      positions: [],
    };
    const walletLoader = new WalletLoader((id, isLogged) => {
      if (id === walletData.id) {
        if (isLogged(walletData.owner.id)) return walletData;
        throw new SignInRequiredError();
      }
      throw new WalletNotFoundError(id);
    });
    useCase = new PositionCreator(
      () => 'positionId',
      walletLoader,
      { loadAssetDataById: () => asset }
    );
  });

  it('should be able create position', async done => {
    const position = await useCase.create(
      'assetId', walletData.id, () => true
    );
    expect(position.asset).toEqual(expect.objectContaining(asset));
    expect(position.wallet.name).toEqual(walletData.name);
    expect(position.wallet.owner).toEqual(
      expect.objectContaining(walletData.owner)
    );
    done();
  });

  it('should not be able create position without been logged', async done => {
    await expect(
      useCase.create('assetId', walletData.id, () => false)
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able create position for inexistent wallet', async done => {
    const id = 'nonWalletId';
    await expect(
      useCase.create('assetId', id, () => true)
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    done();
  });
});
