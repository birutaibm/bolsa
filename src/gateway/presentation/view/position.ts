function operationsSummary(
  operations: ReturnType<PositionEntity['getOperations']>
): OperationsSummary {
  const summary: OperationsSummary = {
    quantity: operations.reduce((acc, {quantity}) => acc + quantity, 0),
  };
  const operation = operations.pop();
  if (operation) {
    summary.open = operations.reduce((acc, {date}) => {
      return acc.getTime() < date.getTime() ? acc : date
    }, operation.date).toISOString();
    if (summary.quantity === 0) {
      summary.close = operations.reduce((acc, {date}) => {
        return acc.getTime() > date.getTime() ? acc : date
      }, operation.date).toISOString();
    }
  }
  return summary;
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
    ...operationsSummary(entity.getOperations()),
  };
}

type PositionView = PositionBase & OperationsSummary;

type OperationsSummary = {
  open?: string;
  close?: string;
  quantity: number;
}

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
