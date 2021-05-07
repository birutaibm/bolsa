import { MayBePromise, Persisted } from '@utils/types';

import { AssetData } from '@domain/wallet/usecases/dtos';

import { RepositoryChangeCommand } from './repository-change-command';

export type PositionData = {
  id: string;
  asset: AssetData;
  walletId: string;
  operationIds: string[];
};

export type PositionWithWalletData = {
  id: string;
  asset: AssetData;
  operationIds: string[];
  wallet: {
    id: string;
    name: string;
    owner: {
      id: string;
      name: string;
    };
  };
};

export interface PositionRepository<E=any> {
  loadPositionWithWalletAndOwnerById(
    id: string
  ): MayBePromise<Persisted<PositionWithWalletData>>;

  loadPositionIdsByWalletId(id: string): MayBePromise<string[]>;

  saveNewPosition(
    assetId: string, walletId: string
  ): RepositoryChangeCommand<{id: string; asset: AssetData},E>;

  loadPositionDataById(positionId: string): MayBePromise<PositionData>;

  loadPositionsDataByIds(positionIds: string[]): MayBePromise<PositionData[]>;
}
