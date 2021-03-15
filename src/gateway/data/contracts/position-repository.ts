import { AssetData as AssetDTO, MayBePromise } from '@domain/wallet/usecases/dtos';

export type AssetData = AssetDTO & {id: string;};

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
  loadPositionsDataByWalletId(id: string): MayBePromise<PositionData[]>;

  saveNewPosition(
    assetId: string, walletId: string
  ): MayBePromise<PositionWithWalletData>;

  loadPositionDataById(positionId: string): MayBePromise<PositionData>;

  loadPositionsDataByIds(positionIds: string[]): MayBePromise<PositionData[]>;
}
