import Wallet from './wallet';

export default class Investor {
  constructor(
    readonly id: string,
    readonly name: string,
    private readonly wallets: Wallet[] = [],
  ) {}

  addWallet(wallet: Wallet): void {
    this.wallets.push(wallet);
  }

  getWallets() {
    return [ ...this.wallets ];
  }
};
