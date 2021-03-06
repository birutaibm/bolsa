import { InvestorData, PositionData } from "@domain/wallet/usecases/create-operation";

type ID = any;

export type OwnerDTO = InvestorData;

export type PositionDTO = PositionData & {
  id?: ID;
};

export type WalletDTO = {
  id?: ID;
  name: string;
  owner: OwnerDTO;
  positions: PositionDTO[];
};
