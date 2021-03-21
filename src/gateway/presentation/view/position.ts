export function positionView(entity: PositionEntity): PositionView {
  return {
    id: entity.id,
    asset: { ticker: entity.asset.ticker, name: entity.asset.name, },
    wallet: {
      name: entity.wallet.name,
      owner: { name: entity.wallet.owner.name, },
    },
    operations: entity.getOperations().map(operation => ({
      date: operation.date.toISOString(),
      quantity: operation.quantity,
      value: operation.value,
    })),
  };
}

type PositionView = PositionBase & {
  operations: Array<{
    date: string;
    quantity: number;
    value: number;
  }>;
};

type PositionEntity = PositionBase & {
  getOperations: () => Array<{
    date: Date;
    quantity: number;
    value: number;
  }>;
}

type PositionBase = {
  id: string;
  asset: Asset
  wallet: {
    name: string;
    owner: {
      name: string;
    };
  };
}

type Asset = {
  ticker: string;
  name: string;
};
