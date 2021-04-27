export function positionView(entity: PositionEntity): PositionView {
  return {
    id: entity.id,
    asset: entity.asset,
    wallet: {
      id: entity.wallet.id, name: entity.wallet.name, owner: {
        id: entity.wallet.owner.id, name: entity.wallet.owner.name,
      }
    },
  };
}

type PositionView = PositionBase;

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
