import { PriceEntity, priceTranslator } from '@gateway/presentation/view/price';

describe('Price view', () => {
  it('should be able to translate entity to view format', () => {
    const common = {
      ticker: 'ITUB4',
      name: 'Itaú Unibanco SA',
      open: 23.32,
      close: 23.32,
      min: 23.32,
      max: 23.32,
    };
    const entity: PriceEntity = {
      ...common,
      date: new Date(),
    };
    const expected = {
      ...common,
      date: entity.date.toISOString(),
    };
    expect(
      priceTranslator.entityToView(entity)
    ).toEqual(expected);
  });

  it('should be able to translate entity to view format in lote', () => {
    const common = {
      ticker: 'ITUB4',
      name: 'Itaú Unibanco SA',
      open: 23.32,
      close: 23.32,
      min: 23.32,
      max: 23.32,
    };
    const entity: PriceEntity = {
      ...common,
      date: new Date(),
    };
    const expected = {
      ...common,
      date: entity.date.toISOString(),
    };
    expect(
      priceTranslator.entitiesToViews([ entity, entity, entity, entity ])
    ).toEqual([ expected, expected, expected, expected ]);
  });
});
