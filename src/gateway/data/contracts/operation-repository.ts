import { MayBePromise } from '@utils/types';

import { AssetData, WalletData } from '@domain/wallet/usecases/dtos';

import { RepositoryChangeCommand } from './repository-change-command';

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

export interface OperationRepository<E=any> {
  loadOperationIdsByPositionId(id: string): MayBePromise<string[]>;

  saveNewOperation(
    data: Omit<OperationData, 'id'>
  ): RepositoryChangeCommand<OperationData,E>;

  loadOperationDataById(id: string): MayBePromise<OperationData>;

  loadOperationsDataByIds(ids: string[]): MayBePromise<OperationData[]>;
}
