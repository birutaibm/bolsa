import { MayBePromise } from '@domain/wallet/usecases/dtos';

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
  loadWalletsDataByIds(ids: string[]): MayBePromise<WalletData[]>;

  loadWalletDataById(id: string): MayBePromise<WalletData>;

  saveNewWallet(
    walletName: string, investorId: string
  ): MayBePromise<PersistedWalletData>;
}
