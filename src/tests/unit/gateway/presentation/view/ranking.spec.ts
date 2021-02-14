import { RankingEntity, rankingTranslator } from '@gateway/presentation/view/ranking';

describe('Ranking view', () => {
  it('should be able to translate entity to view format', () => {
    const common = {
      player: {
        name: 'Rafael',
        country: 'Brasil',
      },
      score: 1,
      heroes: [],
    };
    const entity: RankingEntity = {
      ...common,
      matchDate: new Date(),
    };
    const expected = {
      ...common,
      matchDate: entity.matchDate.toISOString(),
    };
    expect(
      rankingTranslator.entityToView(entity)
    ).toEqual(expected);
  });

  it('should be able to translate entity to view format in lote', () => {
    const common = {
      player: {
        name: 'Rafael',
        country: 'Brasil',
      },
      score: 1,
      heroes: [],
    };
    const entity: RankingEntity = {
      ...common,
      matchDate: new Date(),
    };
    const expected = {
      ...common,
      matchDate: entity.matchDate.toISOString(),
    };
    expect(
      rankingTranslator.entitiesToViews([ entity, entity, entity, entity ])
    ).toEqual([ expected, expected, expected, expected ]);
  });
});
