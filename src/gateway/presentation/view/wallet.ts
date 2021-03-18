export function walletView(entity: WalletEntity): WalletView {
  return {
    id: entity.id, name: entity.name,
    owner: { name: entity.owner.name },
    positions: entity.getPositions().map(position => ({
      asset: { ticker: position.asset.ticker, name: position.asset.name },
      operations: position.getOperations().map(operation => ({
        date: operation.date.toISOString(),
        quantity: operation.quantity,
        value: operation.value,
      })),
    })),
  };
}

type WalletEntity = {
  id: string;
  name: string;
  owner: {
    name: string;
  };
  getPositions: () => PositionEntity[];
};

type WalletView = {
  id: string;
  name: string;
  owner: {
    name: string;
  };
  positions: Array<{
    asset: Asset;
    operations: Array<{
      date: string;
      quantity: number;
      value: number;
    }>;
  }>;
};

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
