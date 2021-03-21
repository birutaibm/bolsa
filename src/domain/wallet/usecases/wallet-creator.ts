import { Wallet } from '@domain/wallet/entities';
import { MayBePromise, Persisted } from './dtos';
import InvestorLoader from './investor-loader';

type WalletCreationData = {investorId: string, name: string};
export type NewWalletSaver =
  (name: string, investorId: string) => MayBePromise<string>;

export default class WalletCreator {
  constructor(
    private readonly save: NewWalletSaver,
    private readonly investors: InvestorLoader,
  ) {}

  async create({name, investorId}: WalletCreationData, loggedUserId: string): Promise<Persisted<Wallet>> {
    const investor = await this.investors.load(investorId, loggedUserId);
    const wallet = new Wallet(name, investor);
    const id = await this.save(name, investorId);
    return Object.assign(wallet, {id});
  }
}
