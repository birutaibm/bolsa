import { MayBePromise, Persisted } from '@utils/types';
import { SignInRequiredError } from '@errors/sign-in-required';

import { Investor, Wallet } from '@domain/wallet/entities';

import { WalletCreationData } from './dtos';
import InvestorLoader from './investor-loader';

export interface NewWalletSaver {
  newWalletOfInvestor(name: string, investorId: string): MayBePromise<string>;

  newWalletAndInvestor(name: string, investorName: string, userId: string):
    MayBePromise<{walletId: string; investorId: string;}>;
}

export default class WalletCreator {
  constructor(
    private readonly saver: NewWalletSaver,
    private readonly investors: InvestorLoader,
  ) {}

  async create({isLogged, ...data}: WalletCreationData): Promise<Persisted<Wallet>> {
    if (!isLogged('investorId' in data ? data.investorId : data.userId)) {
      throw new SignInRequiredError();
    }
    const { id, investor } = await this.saveWallet(data);
    const wallet = new Wallet(data.walletName, investor);
    return Object.assign(wallet, {id});
  }

  private async saveWallet(
    data: { walletName: string; investorId: string; }
        | { walletName: string; investorName: string; userId: string; }
  ): Promise<{investor: Investor, id: string}> {
    if ('investorId' in data) {
      return {
        investor: await this.investors.load(data.investorId),
        id: await this.saver.newWalletOfInvestor(data.walletName, data.investorId),
      };
    }
    const { walletId: id, investorId } = await this.saver.newWalletAndInvestor(
      data.walletName, data.investorName, data.userId
    );
    return {
      id,
      investor: new Investor(investorId, data.investorName),
    };
  }
}
