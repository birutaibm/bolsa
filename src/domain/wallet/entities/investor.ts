import { Persisted } from '@utils/types';
import Wallet from './wallet';

export default class Investor {
  private readonly wallets: Array<Wallet & { id?: string; }> = [];
  private readonly persistedWallets: Persisted<Wallet>[] = [];

  constructor(
    readonly id: string,
    readonly name: string,
  ) {}

  addWallet(wallet: Wallet): void {
    this.wallets.push(wallet);
  }

  getWallets() {
    for (let index = this.wallets.length - 1; index >= 0; index--) {
      const { id } = this.wallets[index];
      if (id !== undefined) {
        const persisted = this.wallets.splice(index, 1)[0];
        this.persistedWallets.push(Object.assign(persisted, { id }));
      }
    }
    if (this.wallets.length > 0) {
      console.warn('Investor has some non-persisted wallets');
    }
    return [ ...this.persistedWallets ];
  }
};
