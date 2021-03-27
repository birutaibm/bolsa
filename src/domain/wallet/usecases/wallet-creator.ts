import { MayBePromise, Persisted } from '@utils/types';
import { SignInRequiredError } from '@errors/sign-in-required';

import { Investor, Wallet } from '@domain/wallet/entities';

import { CheckLoggedUserId, WalletCreationData } from './dtos';
import InvestorLoader from './investor-loader';
import { InvestorCreator } from '.';

export type NewWalletSaver =
  (name: string, investorId: string) => MayBePromise<string>;

export default class WalletCreator {
  constructor(
    private readonly save: NewWalletSaver,
    private readonly investors: InvestorLoader,
    private readonly investorCreator: InvestorCreator,
  ) {}

  async create({walletName, ...data}: WalletCreationData): Promise<Persisted<Wallet>> {
    const investor = await this.getInvestor(data);
    const wallet = new Wallet(walletName, investor);
    const id = await this.save(walletName, investor.id);
    return Object.assign(wallet, {id});
  }

  private async getInvestor(
    { isLogged, ...data }: { investorId: string; isLogged: CheckLoggedUserId; }
      | { investorName: string; userId: string; isLogged: CheckLoggedUserId; }
  ): Promise<Investor> {
    const id = 'investorId' in data ? data.investorId : data.userId;
    if (!isLogged(id)) {
      throw new SignInRequiredError();
    }
    return 'investorId' in data
      ? await this.investors.load(id)
      : await this.investorCreator.create({ id, name: data.investorName});
  }
}
