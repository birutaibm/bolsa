export type RankingDTO = {
  player: {
    name: string;
    country: string;
  };
  score: number;
  matchDate: Date;
  heroes: {
    name: string;
    level: number;
  }[];
};
