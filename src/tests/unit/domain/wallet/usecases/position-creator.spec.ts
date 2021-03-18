import { InvestorNotFoundError, WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { WalletLoader, PositionCreator } from '@domain/wallet/usecases';
import { AssetData, Persisted, PopulatedWalletData } from '@domain/wallet/usecases/dtos';

let walletData: Persisted<PopulatedWalletData>;
let data: {name: string; investorId: string; };
let useCase: PositionCreator;
let asset: AssetData;

describe('Position creator', () => {
  beforeAll(() => {
    asset = { ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    const owner = { id: 'myID', name: 'My Name' };
    const wallet = { name: 'My Wallet', owner };
    walletData = {
      id: 'walletId',
      ...wallet,
      positions: [],
    };
    const walletLoader = new WalletLoader((id, loggedUserId) => {
      if (id === walletData.id) {
        if (walletData.owner.id === loggedUserId) return walletData;
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
      'assetId', walletData.id, walletData.owner.id
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
      useCase.create('assetId', walletData.id, 'hackerID')
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able create position for inexistent wallet', async done => {
    const id = 'nonWalletId';
    await expect(
      useCase.create('assetId', id, walletData.owner.id)
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    done();
  });
});
