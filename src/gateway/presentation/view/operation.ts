export function operationView(entity: OperationEntity): OperationView {
  return {
    id: entity.id,
    quantity: entity.quantity,
    value: entity.value,
    date: entity.date.toISOString(),
    position: {
      asset: {
        ticker: entity.position.asset.ticker,
        name: entity.position.asset.name,
      },
      wallet: {
        name: entity.position.wallet.name,
        owner: { name: entity.position.wallet.owner.name, },
      },
    },
  };
}

type OperationView = OperationBase & {
  date: string;
};

type OperationEntity = OperationBase & {
  date: Date;
}

type OperationBase = {
  id: string;
  quantity: number;
  value: number;
  position: {
    asset: Asset
    wallet: {
      name: string;
      owner: {
        name: string;
      };
    };
  };
}

type Asset = {
  ticker: string;
  name: string;
};
