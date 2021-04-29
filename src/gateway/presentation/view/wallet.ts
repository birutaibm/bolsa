function positionsSummary(
  positions: ReturnType<WalletEntity['getPositions']>
): PositionsSummary {
  const open = positions
    .flatMap(position => position.getOperations())
    .map(operation => operation.date)
    .reduce((oldest: Date | undefined, current: Date) => {
      if (oldest === undefined) return current;
      return oldest.getTime() < current.getTime() ? oldest : current;
    }, undefined);
  const summary: PositionsSummary = {
    positions: positions.map(position => {
      const operations = position.getOperations();
      const quantity = operations.reduce((acc, { quantity }) => acc + quantity, 0);
      return { id: position.id, quantity };
    }).reduce((acc: PositionsSummary['positions'], {id, quantity}) => {
      return quantity === 0
        ? { ...acc, closed: [...acc.closed, id]}
        : { ...acc, opened: [...acc.opened, id]}
    }, {opened: [], closed: []}),
  };
  if (open) {
    summary.open = open.toISOString();
  }
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
};
