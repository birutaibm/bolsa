export function investorView(entity: InvestorEntity): InvestorView {
  return {
    id: entity.id, name: entity.name,
    wallets: entity.getWallets().map(wallet => ({
      id: wallet.id, name: wallet.name,
      positions: wallet.getPositions().map(position => ({
        id: position.id, asset: position.asset,
        operations: position.getOperations().map(operation => ({
          id: operation.id,
          date: operation.date.toISOString(),
          quantity: operation.quantity,
          value: operation.value,
        })),
      })),
    })),
  };
}

type InvestorEntity = {
  id: string;
  name: string;
  getWallets: () => WalletEntity[];
};

type InvestorView = {
  id: string;
  name: string;
  wallets: Array<{
    id: string;
    name: string;
    positions: Array<{
      id: string;
      asset: Asset;
      operations: Operation[];
    }>;
  }>;
};

type WalletEntity = {
  id: string;
  name: string;
  getPositions: () => PositionEntity[];
}

type PositionEntity = {
  id: string;
  asset: Asset
  getOperations: () => Array<{
    id: string;
    date: Date;
    quantity: number;
    value: number;
  }>;
}

type Operation = {
  id: string;
  date: string;
  quantity: number;
  value: number;
}

type Asset = {
  id: string;
  ticker: string;
  name: string;
};
