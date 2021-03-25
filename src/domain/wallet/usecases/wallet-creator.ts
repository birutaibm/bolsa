import { Wallet } from '@domain/wallet/entities';
import { SignInRequiredError } from '@errors/sign-in-required';
import { CheckLoggedUserId, MayBePromise, Persisted } from './dtos';
import InvestorLoader from './investor-loader';

type WalletCreationData = {investorId: string, name: string};
export type NewWalletSaver =
  (name: string, investorId: string) => MayBePromise<string>;

export default class WalletCreator {
  constructor(
    private readonly save: NewWalletSaver,
    private readonly investors: InvestorLoader,
  ) {}

  async create({name, investorId}: WalletCreationData, isLogged: CheckLoggedUserId): Promise<Persisted<Wallet>> {
    if (!isLogged(investorId)) {
      throw new SignInRequiredError();
    }
    const investor = await this.investors.load(investorId);
    const wallet = new Wallet(name, investor);
    const id = await this.save(name, investorId);
    return Object.assign(wallet, {id});
  }
}
