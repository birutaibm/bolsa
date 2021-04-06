import Wallet from './wallet';

export default class Investor {
  private readonly wallets: Wallet[] = [];

  constructor(
    readonly id: string,
    readonly name: string,
  ) {}

  addWallet(wallet: Wallet): void {
    this.wallets.push(wallet);
  }

  getWallets() {
    return [ ...this.wallets ];
  }
};
