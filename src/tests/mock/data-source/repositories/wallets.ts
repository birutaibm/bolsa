import { InvestorNotFoundError, WalletNotFoundError } from '@errors/not-found';

import {
  PersistedWalletData, WalletData, WalletRepository,
  RepositoryChangeCommand, RepositoryChangeCommandExecutors,
} from '@gateway/data/contracts';

import { executor } from '.';

import { investors, wallets } from './wallet-module-data';

export class FakeWalletRepository implements WalletRepository<void> {
  getChangeCommandExecutors(): RepositoryChangeCommandExecutors<any> {
    return {
      singleCommandExecutor: executor.append.bind(executor),
      multiCommandExecutor: () => executor,
    };
  }

  loadWalletWithOwnerById(id: string): PersistedWalletData {
    const { name, ownerId, positionIds } = this.loadWalletDataById(id);
    const owner = investors.find(investor => investor.id === ownerId);
    if (!owner) {
      throw new InvestorNotFoundError(ownerId);
    }
    return {id, name, owner, positionIds};
  }

  loadWalletIdsByOwnerId(id: string): string[] {
    return wallets
      .filter(wallet => wallet.ownerId === id)
      .map(wallet => wallet.id);
  }

  loadWalletsDataByIds(ids: string[]): WalletData[] {
    return ids.map(this.loadWalletDataById);
  }

  loadWalletDataById(id: string): WalletData {
    const index = Number(id);
    if (Number.isNaN(index)) {
      throw new WalletNotFoundError(id);
    }
    return wallets[index];
  }

  saveNewWallet(
    walletName: string, investorId: string
  ): RepositoryChangeCommand<PersistedWalletData,void> {
    return () => {
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

  saveNewWalletAndInvestor(
    walletName: string, investorName: string, userId: string
  ): { id: string; ownerId: string; } {
    const id = String(wallets.length);
    investors.push({ id: userId, name: investorName, walletIds: [id] });
    const wallet: WalletData = {
      id, name: walletName, ownerId: userId, positionIds: [],
    };
    wallets.push(wallet);
    return wallet;
  }
}
