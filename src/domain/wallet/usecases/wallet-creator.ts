import { Wallet } from '@domain/wallet/entities';
import { MayBePromise, Persisted, WalletData } from './dtos';
import InvestorLoader from './investor-loader';

type WalletCreationData = {investorId: string, name: string};
export type NewWalletSaver =
  (name: string, investorId: string, loggedUserId: string) => MayBePromise<Persisted<WalletData>>;

export default class WalletCreator {
  constructor(
    private readonly save: NewWalletSaver,
    private readonly investors: InvestorLoader,
  ) {}

  async create({name, investorId}: WalletCreationData, loggedUserId: string): Promise<Persisted<Wallet>> {
    const investor = await this.investors.load(investorId, loggedUserId);
    const wallet = new Wallet(name, investor);
    const { id } = await this.save(name, investorId, loggedUserId);
    return Object.assign(wallet, {id});
  }
}
