import { MayBePromise } from '@domain/wallet/usecases/dtos';
import { InvestorNotFoundError, WalletNotFoundError } from '@errors/not-found';

import { PersistedWalletData, WalletData, WalletRepository } from '@gateway/data/contracts';

import { investors, wallets } from './wallet-module-data';

export class FakeWalletRepository implements WalletRepository {
  loadWalletIdsByOwnerId(id: string): MayBePromise<string[]> {
    return wallets
      .filter(wallet => wallet.ownerId === id)
      .map(wallet => wallet.id);
  }

  loadWalletsDataByIds(ids: string[]): WalletData[] {
    return ids.map(this.loadWalletDataById);
  }

  loadWalletDataById(id: string): WalletData {
    const index = Number(id);
    if (isNaN(index)) {
      throw new WalletNotFoundError(id);
    }
    return wallets[index];
  }

  saveNewWallet(walletName: string, investorId: string): PersistedWalletData {
    const id = String(wallets.length);
    const wallet: WalletData = { id, name: walletName, ownerId: investorId, positionIds: [] };
    const investor = investors.find(investor => investor.id === investorId);
    if (!investor) {
      throw new InvestorNotFoundError(investorId);
    }
    investor.walletIds.push(id);
    wallets.push(wallet);
    return { ...wallet, owner: investor };
  }
}
