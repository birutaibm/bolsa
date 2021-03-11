import { Position, Wallet, Operation } from '@domain/wallet/entities';

export type Persisted<T> = T & { id: any };
export type MayBePromise<T> = T | Promise<T>;

export type InvestorData = {id: string, name: string};
type PopulatedInvestor = InvestorData & { wallets: Wallet[] };
export type PopulatedInvestorData = InvestorData & {
  wallets: PopulatedWalletData[]
};

export type WalletData = {
  name: string, owner: InvestorData,
};
type PopulatedWallet = Persisted<WalletData> & {
  positions: Position[],
}
export type PopulatedWalletData = WalletData & {
  positions: PopulatedPositionData[],
};

export type AssetData = {
  ticker: string, name: string,
}

export type PositionData = {
  wallet: WalletData, asset: AssetData,
};
type PopulatedPosition = Persisted<PositionData> & {
  operations: Operation[],
}
export type PopulatedPositionData = Persisted<PositionData> & {
  operations: OperationData[],
};

export type OperationData = {
  date: Date; quantity: number; value: number; position: PositionData
}
