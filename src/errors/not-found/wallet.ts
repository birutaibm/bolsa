import NotFoundError from '.';

export class WalletNotFoundError extends NotFoundError {
  constructor(name: string) {
    super('Wallet', name);
    this.name = 'WalletNotFoundError';
  }
}
