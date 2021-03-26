export function walletView(entity: WalletEntity): WalletView {
  return {
    id: entity.id, name: entity.name,
    owner: { id: entity.owner.id, name: entity.owner.name },
    positions: entity.getPositions().map(position => ({
      id: position.id,
      asset: position.asset,
      operations: position.getOperations().map(operation => ({
        id: operation.id,
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
    id: string;
    name: string;
  };
  getPositions: () => PositionEntity[];
};

type WalletView = {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
  };
  positions: Array<{
    id: string;
    asset: Asset;
    operations: Array<{
      id: string;
      date: string;
      quantity: number;
      value: number;
    }>;
  }>;
};

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

type Asset = {
  id: string;
  ticker: string;
  name: string;
};
