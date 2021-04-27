function positionOpenDate(
  operations: ReturnType<PositionEntity['getOperations']>
): string | undefined {
  const operation = operations.pop();
  if (operation) {
    return operations.reduce((acc, {date}) => {
      return acc.getTime() < date.getTime() ? acc : date
    }, operation.date).toISOString()
  }
  return;
}

export function positionView(entity: PositionEntity): PositionView {
  return {
    id: entity.id,
    asset: entity.asset,
    wallet: {
      id: entity.wallet.id, name: entity.wallet.name, owner: {
        id: entity.wallet.owner.id, name: entity.wallet.owner.name,
      }
    },
    open: positionOpenDate(entity.getOperations()),
  };
}

type PositionView = PositionBase & {
  open?: string;
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
