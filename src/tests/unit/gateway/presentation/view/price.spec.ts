import { company } from 'faker';

import { PriceEntity, priceTranslator } from '@gateway/presentation/view/price';

import { fakePrice, fakeTicker } from '@mock/price';

describe('Price view', () => {
  it('should be able to translate entity to view format', () => {
    const entity: PriceEntity = {
      ...fakePrice(),
      ticker: fakeTicker(),
      name: company.companyName(),
    };
    const expected = {
      ...entity,
      date: entity.date.toISOString(),
    };
    expect(
      priceTranslator.entityToView(entity)
    ).toEqual(expected);
  });

  it('should be able to translate entity to view format in lote', () => {
    const entity: PriceEntity = {
      ...fakePrice(),
      ticker: fakeTicker(),
      name: company.companyName(),
    };
    const expected = {
      ...entity,
      date: entity.date.toISOString(),
    };
    expect(
      priceTranslator.entitiesToViews([ entity, entity, entity, entity ])
    ).toEqual([ expected, expected, expected, expected ]);
  });
});
