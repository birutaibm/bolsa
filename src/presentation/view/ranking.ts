import { Ranking as RankingEntity } from '@domain/entities';

export class Ranking {
  player: Player;
  score: number;
  matchDate: string;
  heroes: Hero[];

  static fromEntity(entity: RankingEntity): Ranking {
    return {
      ...entity,
      matchDate: entity.matchDate.toISOString(),
    };
  };

  static fromEntities(entities: RankingEntity[]): Ranking[] {
    return entities.map(Ranking.fromEntity);
  };
};

type Player = {
  name: string;
  country: string;
};

type Hero = {
  name: string;
  level: number;
};
