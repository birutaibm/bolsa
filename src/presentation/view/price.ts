export const priceTranslator = {
  entityToView(entity: PriceEntity): PriceView {
    return {
      ...entity,
      date: entity.date.toISOString(),
    };
  },

  entitiesToViews(entities: PriceEntity[]): PriceView[] {
    return entities.map(priceTranslator.entityToView);
  }
};

export type PriceEntity = Price & {
  date: Date;
};

export type PriceView = Price & {
  date: string;
};

type Price = {
  ticker: string;
  name: string;
  open: number;
  close: number;
  min: number;
  max: number;
};
