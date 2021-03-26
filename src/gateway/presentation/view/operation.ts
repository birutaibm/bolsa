export function operationView(entity: OperationEntity): OperationView {
  return {
    id: entity.id,
    quantity: entity.quantity,
    value: entity.value,
    date: entity.date.toISOString(),
    position: {
      id: entity.position.id, asset: entity.position.asset, wallet: {
        id: entity.position.wallet.id, name: entity.position.wallet.name,
        owner: {
          id: entity.position.wallet.owner.id,
          name: entity.position.wallet.owner.name,
        }
      }
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
  };
}

type Asset = {
  id: string;
  ticker: string;
  name: string;
};
