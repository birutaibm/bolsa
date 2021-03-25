export function investorView(entity: InvestorEntity): InvestorView {
  return {
    id: entity.id, name: entity.name,
    wallets: entity.getWallets().map(wallet => ({
      name: wallet.name,
      positions: wallet.getPositions().map(position => ({
        asset: { ticker: position.asset.ticker, name: position.asset.name },
        operations: position.getOperations().map(operation => ({
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
    name: string;
    positions: Array<{
      asset: Asset;
      operations: Operation[];
    }>;
  }>;
};

type WalletEntity = {
  name: string;
  getPositions: () => PositionEntity[];
}

type PositionEntity = {
  asset: Asset
  getOperations: () => Array<{
    date: Date;
    quantity: number;
    value: number;
  }>;
}

type Operation = {
  date: string;
  quantity: number;
  value: number;
}

type Asset = {
  ticker: string;
  name: string;
};
