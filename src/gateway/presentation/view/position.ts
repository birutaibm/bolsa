function operationsSummary(
  operations: ReturnType<PositionEntity['getOperations']>
): OperationsSummary {
  const summary: OperationsSummary = {
    quantity: operations.reduce((acc, {quantity}) => acc + quantity, 0),
    monetary: operations.reduce(
      (acc, {value}) => value < 0
        ? {...acc, totalSpend: acc.totalSpend - value}
        : {...acc, totalReceived: acc.totalReceived + value},
      {totalSpend: 0, totalReceived: 0}
    ),
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
  const asset: Asset<LastPriceView> = {
    id: entity.asset.id,
    ticker: entity.asset.ticker,
    name: entity.asset.name,
  };
  if (entity.asset.lastPrice) {
    asset.lastPrice = {
      date: entity.asset.lastPrice.date.toISOString(),
      price: entity.asset.lastPrice.price,
    };
  }
  return {
    id: entity.id,
    asset,
    wallet: {
      id: entity.wallet.id, name: entity.wallet.name, owner: {
        id: entity.wallet.owner.id, name: entity.wallet.owner.name,
      }
    },
    ...operationsSummary(entity.getOperations()),
  };
}

type PositionView = PositionBase<LastPriceView> & OperationsSummary;

type OperationsSummary = {
  open?: string;
  close?: string;
  quantity: number;
  monetary: {
    totalSpend: number;
    totalReceived: number;
  }
}

type PositionEntity = PositionBase<LastPriceEntity> & {
  getOperations: () => Array<{
    id: string;
    date: Date;
    quantity: number;
    value: number;
  }>;
}

type PositionBase<T extends LastPrice> = {
  id: string;
  asset: Asset<T>
  wallet: {
    id: string;
    name: string;
    owner: {
      id: string;
      name: string;
    };
  };
}

type Asset<T extends LastPrice> = {
  id: string;
  ticker: string;
  name: string;
  lastPrice?: T;
};

type LastPrice = LastPriceEntity | LastPriceView;

type LastPriceEntity = {
  date: Date;
  price: number;
};

type LastPriceView = {
  date: string;
  price: number;
};
