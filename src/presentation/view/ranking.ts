export const rankingTranslator = {
  entityToView(entity: RankingEntity): RankingView {
    return {
      ...entity,
      matchDate: entity.matchDate.toISOString(),
    };
  },

  entitiesToViews(entities: RankingEntity[]): RankingView[] {
    return entities.map(rankingTranslator.entityToView);
  }
};

export type RankingEntity = Ranking & {
  matchDate: Date;
};

export type RankingView = Ranking & {
  matchDate: string;
};

type Ranking = {
  player: Player;
  score: number;
  heroes: Hero[];
};

type Player = {
  name: string;
  country: string;
};

type Hero = {
  name: string;
  level: number;
};
