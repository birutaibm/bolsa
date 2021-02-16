import { Factory } from '@utils/factory';

import {
  RepositoryFactories
} from '@gateway/factories';
import Security from '@gateway/security';

import RankingUseCasesFactories from './ranking';
import PriceUseCasesFactories from './price';
import UserUseCasesFactories from './user';

export function createUseCasesFactories(
  { ranking, prices, user }: RepositoryFactories,
  security: Factory<Security>,
) {
  const rankingUseCases = new RankingUseCasesFactories(ranking.make());
  const priceUseCases = new PriceUseCasesFactories(prices.make());
  const userUseCases = new UserUseCasesFactories(user.make(), security.make());

  return {
    price: priceUseCases.getAll(),
    user : userUseCases.getAll(),
    ranking: rankingUseCases.getAll().loader,
  };
}

export type UseCasesFactories = ReturnType<typeof createUseCasesFactories>;
