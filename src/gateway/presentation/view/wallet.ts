function positionsSummary(
  positions: ReturnType<WalletEntity['getPositions']>
): PositionsSummary {
  const summary: PositionsSummary = {
    positions: {opened: [], closed: []},
    monetary: {totalSpend: 0, totalReceived: 0, totalLastPrice: 0},
  };
  const operations = positions.flatMap(position => position.getOperations());
  const open = operations.reduce((oldest: Date | undefined, {date: current}) => {
    if (oldest === undefined) return current;
    return oldest.getTime() < current.getTime() ? oldest : current;
  }, undefined);
  summary.monetary = operations.reduce((acc, {value}) => {
    return value < 0
      ? {...acc, totalSpend: acc.totalSpend - value}
      : {...acc, totalReceived: acc.totalReceived + value};
  }, summary.monetary);
  if (open) {
    summary.open = open.toISOString();
  }
  summary.positions = positions.reduce((acc, position) => {
    const operations = position.getOperations();
    const quantity = operations.reduce((acc, { quantity }) => acc + quantity, 0);
    if (quantity === 0) {
      return { ...acc, closed: [ ...acc.closed, position.id ]};
    } else {
      const { lastPrice } = position.asset;
      if (lastPrice) {
        summary.monetary.totalLastPrice += quantity * lastPrice.price;
      }
      return { ...acc, opened: [ ...acc.opened, position.id ]};
    }
  }, summary.positions);
  return summary;
}

export function walletView(entity: WalletEntity): WalletView {
  return {
    id: entity.id, name: entity.name,
    owner: { id: entity.owner.id, name: entity.owner.name },
    ...positionsSummary(entity.getPositions()),
  };
}

type WalletEntity = WalletBase & {
  getPositions: () => PositionEntity[];
};

type WalletView = WalletBase & PositionsSummary;

type WalletBase = {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
  };
};

type PositionsSummary = {
  open?: string;
  positions: {
    opened: string[]; // Id
    closed: string[]; // Id
  }
  monetary: {
    totalSpend: number;
    totalReceived: number;
    totalLastPrice: number;
  }
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

type Asset = {
  id: string;
  ticker: string;
  name: string;
  lastPrice?: LastPrice;
};

type LastPrice = {
  date: Date;
  price: number;
};
