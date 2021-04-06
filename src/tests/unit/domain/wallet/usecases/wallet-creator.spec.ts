import { SignInRequiredError } from '@errors/sign-in-required';
import { InvestorNotFoundError } from '@errors/not-found';

import { WalletCreator } from '@domain/wallet/usecases';
import { PopulatedInvestorData } from '@domain/wallet/usecases/dtos';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-saver';

let investorData: PopulatedInvestorData
let data: {walletName: string; investorId: string; };
let useCase: WalletCreator;

describe('Wallet creator', () => {
  beforeAll(() => {
    const saver = new WalletModuleSavers();
    investorData = { ...saver.owner, wallets: [] };
    useCase = new WalletCreator(saver.newWallet.bind(saver));
    data = { walletName: 'My Wallet', investorId: investorData.id };
  });

  it('should be able create wallet', async done => {
    const wallet = await useCase.create({...data, isLogged: () => true});
    expect(wallet.name).toEqual(data.walletName);
    expect(wallet.owner.id).toEqual(data.investorId);
    expect(wallet.getPositions()).toEqual([]);
    done();
  });

  it('should not be able create wallet without been logged', async done => {
    await expect(
      useCase.create({...data, isLogged: () => false})
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able create wallet for non-investorId', async done => {
    const id = 'nonInvestorId';
    await expect(
      useCase.create({walletName: data.walletName, investorId: id, isLogged: () => true})
    ).rejects.toBeInstanceOf(InvestorNotFoundError);
    done();
  });

  it('should be able create wallet and investor', async done => {
    const id = 'nonInvestorId';
    await expect(useCase.create({
      walletName: data.walletName, userId: id, investorName: 'My Name',
      isLogged: () => true
    })).resolves.toEqual(expect.objectContaining({
      owner: expect.objectContaining({ id })
    }));
    done();
  });
});
