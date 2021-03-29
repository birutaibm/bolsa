import { MayBePromise } from '@utils/types';

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
};

export interface WalletRepository {
  loadWalletIdsByOwnerId(id: string): MayBePromise<string[]>;

  loadWalletsDataByIds(ids: string[]): MayBePromise<WalletData[]>;

  loadWalletDataById(id: string): MayBePromise<WalletData>;

  saveNewWallet(
    walletName: string, investorId: string
  ): MayBePromise<{id: string;}>;

  saveNewWalletAndInvestor(
    walletName: string, investorName: string, userId: string
  ): MayBePromise<{id: string; ownerId: string;}>;
}
