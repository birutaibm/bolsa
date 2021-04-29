export function walletView(entity: WalletEntity): WalletView {
  return {
    id: entity.id, name: entity.name,
    owner: { id: entity.owner.id, name: entity.owner.name },
    positions: entity.getPositions().map(position => position.id),
  };
}

type WalletEntity = WalletBase & {
  getPositions: () => PositionEntity[];
};

type WalletView = WalletBase & {
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
