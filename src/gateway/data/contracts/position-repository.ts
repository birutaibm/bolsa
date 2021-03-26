import { MayBePromise, Persisted } from '@utils/types';

import { AssetData as AssetDTO } from '@domain/wallet/usecases/dtos';

export type AssetData = Persisted<AssetDTO>;

export type PositionData = {
  id: string;
  asset: AssetData;
  walletId: string;
  operationIds: string[];
};

export type PositionWithWalletData = {
  id: string;
  asset: AssetData;
  wallet: {
    id: string;
    name: string;
    ownerId: string;
  };
};

export interface PositionRepository {
  loadPositionIdsByWalletId(id: string): MayBePromise<string[]>;

  saveNewPosition(
    assetId: string, walletId: string
  ): MayBePromise<{id: string;}>;

  loadPositionDataById(positionId: string): MayBePromise<PositionData>;

  loadPositionsDataByIds(positionIds: string[]): MayBePromise<PositionData[]>;
}
