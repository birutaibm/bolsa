import { InvestorData, OperationData, PositionData, WalletData } from "@gateway/data/contracts";

export const operations: OperationData[] = [{
  id: '0',
  date: new Date(),
  quantity: 100,
  value: -2345,
  positionId: '0',
}];

export const positions: PositionData[] = [{
  id: '0',
  asset: {
    id: '0',
    ticker: 'BBAS3',
    name: 'Banco do Brasil',
  },
  walletId: '0',
  operationIds: ['0'],
}];

export const wallets: WalletData[] = [{
  id: '0',
  name: 'Test Existent Wallet',
  ownerId: '1',
  positionIds: ['0'],
}];

export const investors: InvestorData[] = [{
  id: '1',
  name: 'Investor Name',
  walletIds: ['0'],
}];
