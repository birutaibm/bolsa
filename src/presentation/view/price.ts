import { Price as PriceEntity } from '@domain/entities';

export class Price {
  ticker: string;
  date: string;
  name: string;
  open: number;
  close: number;
  min: number;
  max: number;

  static fromEntity(entity: PriceEntity): Price {
    return {
      ...entity,
      date: entity.date.toISOString(),
    };
  };

  static fromEntities(entities: PriceEntity[]): Price[] {
    return entities.map(Price.fromEntity);
  };
};
