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
    operations: entity.getOperations().map(operation => ({
      id: operation.id,
      date: operation.date.toISOString(),
      quantity: operation.quantity,
      value: operation.value,
    })),
  };
}

type PositionView = PositionBase<LastPriceView> & {
  operations: Array<{
    id: string;
    date: string;
    quantity: number;
    value: number;
  }>;
};

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
