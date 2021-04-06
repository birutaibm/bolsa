import { WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';
import { Persisted } from '@utils/types';

import { PositionCreator } from '@domain/wallet/usecases';
import { AssetData, PopulatedWalletData } from '@domain/wallet/usecases/dtos';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-saver';

let walletData: Persisted<PopulatedWalletData>;
let useCase: PositionCreator;
let asset: Persisted<AssetData>;

describe('Position creator', () => {
  beforeAll(() => {
    const saver = new WalletModuleSavers();
    asset = saver.asset;
    walletData = { ...saver.wallet, positions: [] };
    useCase = new PositionCreator(saver.newPosition.bind(saver));
  });

  it('should be able create position', async done => {
    const position = await useCase.create({
      assetId: 'assetId', walletId: walletData.id, isLogged: () => true
    });
    expect(position.asset).toEqual(expect.objectContaining(asset));
    expect(position.wallet.name).toEqual(walletData.name);
    expect(position.wallet.owner).toEqual(
      expect.objectContaining(walletData.owner)
    );
    done();
  });

  it('should not be able create position without been logged', async done => {
    await expect(
      useCase.create({
        assetId: 'assetId', walletId: walletData.id, isLogged: () => false
      })
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able create position for inexistent wallet', async done => {
    const id = 'nonWalletId';
    await expect(
      useCase.create({
        assetId: 'assetId', walletId: id, isLogged: () => true
      })
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    done();
  });
});
