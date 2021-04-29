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
  const summary: PositionsSummary = {};
  if (open) {
    summary.open = open.toISOString();
  }
  return summary;
}

export function walletView(entity: WalletEntity): WalletView {
  return {
    id: entity.id, name: entity.name,
    owner: { id: entity.owner.id, name: entity.owner.name },
    positions: entity.getPositions().map(position => position.id),
    ...positionsSummary(entity.getPositions()),
  };
}

type WalletEntity = WalletBase & {
  getPositions: () => PositionEntity[];
};

type WalletView = WalletBase & PositionsSummary & {
  positions: string[]; // Id
};

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
