import { MayBePromise } from '@utils/types';
import { RepositoryChangeCommand, RepositoryChangeCommandExecutors } from './repository-change-command';

export type WalletData = {
  id: string;
  name: string;
  ownerId: string;
  positionIds: string[];
};

export type PersistedWalletData = {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
  }
  positionIds: string[];
};

export interface WalletRepository<E=any> {
  getChangeCommandExecutors(): RepositoryChangeCommandExecutors;

  loadWalletIdsByOwnerId(id: string): MayBePromise<string[]>;

  loadWalletsDataByIds(ids: string[]): MayBePromise<WalletData[]>;

  loadWalletDataById(id: string): MayBePromise<WalletData>;

  loadWalletWithOwnerById(id: string): MayBePromise<PersistedWalletData>;

  saveNewWallet(
    walletName: string, investorId: string
  ): RepositoryChangeCommand<{id: string;},E>;
}
