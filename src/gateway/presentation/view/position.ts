export function positionView(entity: PositionEntity): PositionView {
  return {
    id: entity.id,
    asset: entity.asset,
    wallet: {
      id: entity.wallet.id, name: entity.wallet.name, owner: {
        id: entity.wallet.owner.id, name: entity.wallet.owner.name,
      }
    },
    operations: entity.getOperations().map(operation => ({
      id: operation.id,
      date: operation.date.toISOString(),
      quantity: operation.quantity,
      value: operation.value,
    })),
  };
}

type PositionView = PositionBase & {
  operations: Array<{
    id: string;
    date: string;
    quantity: number;
    value: number;
  }>;
};

type PositionEntity = PositionBase & {
  getOperations: () => Array<{
    id: string;
    date: Date;
    quantity: number;
    value: number;
  }>;
}

type PositionBase = {
  id: string;
  asset: Asset
  wallet: {
    id: string;
    name: string;
    owner: {
      id: string;
      name: string;
    };
  };
}

type Asset = {
  id: string;
  ticker: string;
  name: string;
};
