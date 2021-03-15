export class WalletNotFoundError extends Error {
  constructor(name: string) {
    super(`Wallet ${name} not found`);
    this.name = 'WalletNotFoundError';
  }
}
