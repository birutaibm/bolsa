import { InvestorLoader, WalletCreator } from '@domain/wallet/usecases';
import { PopulatedInvestorData } from '@domain/wallet/usecases/dtos';
import { InvestorNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

let investorData: PopulatedInvestorData
let data: {name: string; investorId: string; };
let useCase: WalletCreator;

describe('Wallet creator', () => {
  beforeAll(() => {
    investorData = {
      id: 'myID',
      name: 'My Name',
      wallets: [],
    }
    const investorLoader = new InvestorLoader(id => {
      if (id === investorData.id) return investorData;
      throw new InvestorNotFoundError(id);
    })
    useCase = new WalletCreator(
      (name, investorId) => 'walletId',
      investorLoader,
    );
    data = { name: 'My Wallet', investorId: investorData.id };
  });

  it('should be able create wallet', async done => {
    const wallet = await useCase.create(data, () => true);
    expect(wallet.name).toEqual(data.name);
    expect(wallet.owner.id).toEqual(data.investorId);
    expect(wallet.getPositions()).toEqual([]);
    done();
  });

  it('should not be able create wallet without been logged', async done => {
    await expect(
      useCase.create(data, () => false)
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able create wallet for non-investor', async done => {
    const id = 'nonInvestorId';
    await expect(
      useCase.create({...data, investorId: id}, () => true)
    ).rejects.toBeInstanceOf(InvestorNotFoundError);
    done();
  });
});
