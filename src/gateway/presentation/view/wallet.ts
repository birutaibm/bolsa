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

function formatPosition(position: PositionEntity): PositionView {
  const asset: Asset<LastPriceView> = {
    id: position.asset.id,
    ticker: position.asset.ticker,
    name: position.asset.name,
  };
  if (position.asset.lastPrice) {
    asset.lastPrice = {
      date: position.asset.lastPrice.date.toISOString(),
      price: position.asset.lastPrice.price,
    };
  }
  return {
    id: position.id,
    asset,
    ...operationsSummary(position.getOperations()),
  };
}

export function walletView(entity: WalletEntity): WalletView {
  return {
    id: entity.id, name: entity.name,
    owner: { id: entity.owner.id, name: entity.owner.name },
    positions: entity.getPositions().map(formatPosition),
  };
}

type WalletEntity = WalletBase & {
  getPositions: () => PositionEntity[];
};

type WalletView = WalletBase & {
  positions: PositionView[];
};

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

type WalletBase = {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
  };
};
