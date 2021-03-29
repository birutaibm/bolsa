import { MayBePromise } from '@utils/types';
import { AssetData, WalletData } from '@domain/wallet/usecases/dtos';

export type OperationData = {
  id: string;
  positionId: string;
  date: Date;
  quantity: number;
  value: number;
};

export type PopulatedOperationData = {
  id: string;
  position: {
    id: string;
    asset: AssetData;
    wallet: WalletData;
  };
  date: number;
  quantity: number;
  value: number;
};

export interface OperationRepository {
  loadOperationIdsByPositionId(id: string): MayBePromise<string[]>;

  saveNewOperation(
    data: Omit<OperationData, 'id'>
  ): MayBePromise<OperationData>;

  loadOperationDataById(id: string): MayBePromise<OperationData>;

  loadOperationsDataByIds(ids: string[]): MayBePromise<OperationData[]>;
}
