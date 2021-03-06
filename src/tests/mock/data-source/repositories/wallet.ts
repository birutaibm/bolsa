import { WalletNotFoundError } from '@errors/wallet-not-found';
import { WalletRepository } from '@gateway/data/contracts';
import { WalletDTO } from '@gateway/data/dto';

export class FakeWalletRepository implements WalletRepository {
  private readonly wallets: WalletDTO[] = [];

  getWalletFromNameAndOwner(wallet: string, owner: string): WalletDTO {
    const index = this.wallets.findIndex(data =>
      data.name === wallet && data.owner.name === owner
    );
    if (index === -1) {
      throw new WalletNotFoundError(wallet);
    }
    return this.wallets[index];
  }

  save(wallet: WalletDTO): WalletDTO {
    let index = this.wallets.findIndex(data =>
      data.name === wallet.name && data.owner.name === wallet.owner.name
    );
    if (index === -1) {
      index = this.wallets.length;
    }
    this.wallets[index] = wallet;
    return wallet;
  }
}
