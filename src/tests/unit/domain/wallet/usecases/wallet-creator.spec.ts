import { InvestorLoader, WalletCreator } from '@domain/wallet/usecases';
import { PopulatedInvestorData } from '@domain/wallet/usecases/dtos';
import { InvestorNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

let investorData: PopulatedInvestorData
let data: {walletName: string; investorId: string; };
let useCase: WalletCreator;

describe('Wallet creator', () => {
  beforeAll(() => {
    investorData = {
      id: 'myID',
      name: 'My Name',
      wallets: [],
    }
    useCase = new WalletCreator(data => {
      if (!data.isLogged('investorId' in data ? data.investorId : data.userId))
        throw new SignInRequiredError();
      if ('investorId' in data) return {
        id: 'walletId', name: data.walletName,
        owner: { id: data.investorId, name: 'Investor Name' },
      };
      return {
        id: 'walletId', name: data.walletName,
        owner: { id: data.userId, name: data.investorName },
      };
    });
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

  it('should be able create wallet and investor for non-investorId', async done => {
    const id = 'nonInvestorId';
    await expect(
      useCase.create({walletName: data.walletName, investorId: id, isLogged: () => true})
    ).resolves.toEqual(expect.objectContaining({
      owner: expect.objectContaining({ id })
    }));
    done();
  });
});
