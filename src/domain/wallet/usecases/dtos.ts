import { Persisted } from '@utils/types';

export type CheckLoggedUserId = (investorId: string) => boolean;

export type InvestorData = {id: string, name: string};
export type PopulatedInvestorData = InvestorData & {
  wallets: PopulatedWalletData[]
};

export type WalletData = {
  name: string, owner: InvestorData,
};
export type PopulatedWalletData = WalletData & {
  positions: PopulatedPositionData[],
};

export type AssetData = {
  ticker: string, name: string,
}

export type PositionData = {
  wallet: WalletData, asset: AssetData,
};
export type PopulatedPositionData = Persisted<PositionData> & {
  operations: OperationData[],
};

export type OperationData = {
  date: Date; quantity: number; value: number; position: Persisted<PositionData>
}
