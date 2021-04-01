import { MayBePromise, Persisted } from '@utils/types';

import { Investor, Wallet } from '@domain/wallet/entities';

import { WalletCreationData } from './dtos';

export type NewWalletSaver = (data: WalletCreationData) => MayBePromise<
    {id: string; name: string; owner: {id: string; name: string; }}
  >;

export default class WalletCreator {
  constructor(
    private readonly save: NewWalletSaver,
  ) {}

  async create(data: WalletCreationData): Promise<Persisted<Wallet>> {
    const { id, name, owner } = await this.save(data);
    const investor = new Investor(owner.id, owner.name);
    const wallet = new Wallet(name, investor);
    return Object.assign(wallet, {id});
  }
}
