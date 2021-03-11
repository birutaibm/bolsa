import { InvestorNotFoundError } from '@errors/investor-not-found';
import { PersistedWalletData, WalletData, WalletRepository } from '@gateway/data/contracts';
import { investors, wallets } from './wallet-module-data';

export class FakeWalletRepository implements WalletRepository {
  loadWalletsDataByIds(ids: string[]): WalletData[] {
    return ids.map(this.loadWalletDataById);
  }

  loadWalletDataById(id: string): WalletData {
    const index = Number(id);
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
