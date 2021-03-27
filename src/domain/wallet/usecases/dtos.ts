import { Persisted } from '@utils/types';
import { Operation, Position } from '../entities';

export type CheckLoggedUserId = (investorId: string) => boolean;

export type InvestorData = {id: string, name: string};
export type PopulatedInvestorData = InvestorData & {
  wallets: Persisted<PopulatedWalletData>[]
};

export type WalletData = {
  name: string, owner: InvestorData,
};
export type PopulatedWalletData = WalletData & {
  positions: Persisted<PopulatedPositionData>[],
};

export type AssetData = {
  ticker: string, name: string,
}

export type PositionData = {
  wallet: Persisted<WalletData>, asset: Persisted<AssetData>,
};
export type PopulatedPositionData = Persisted<PositionData> & {
  operations: Persisted<OperationData>[],
};

export type OperationData = {
  date: Date; quantity: number; value: number; position: Persisted<PositionData>
};

export type OperationCreationData = OperationCreationDataWithPosition
                                  | OperationCreationDataWithWallet;
export type OperationCreationBaseData = {
  date: Date;
  quantity: number;
  value: number;
  isLogged: CheckLoggedUserId
};
export type OperationCreationDataWithPosition = OperationCreationBaseData & {
  positionId: string;
};
export type OperationCreationDataWithWallet = OperationCreationBaseData & {
  assetId: string;
  walletId: string;
};
