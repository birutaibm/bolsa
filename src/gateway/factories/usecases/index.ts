import { Factory } from '@utils/factory';

import {
  RepositoryFactories
} from '@gateway/factories';
import Security from '@gateway/security';

import createRankingUseCasesFactories from './ranking';
import createPriceUseCasesFactories from './price';
import createUserUseCasesFactories from './user';

export function createUseCasesFactories(
  { ranking, prices, user }: RepositoryFactories,
  security: Factory<Security>,
) {
  const rankingUseCases = createRankingUseCasesFactories(ranking.make());
  const priceUseCases = createPriceUseCasesFactories(prices.make());
  const userUseCases = createUserUseCasesFactories(user.make(), security.make());

  return {
    price: priceUseCases,
    user : userUseCases,
    ranking: rankingUseCases.loader,
  };
}

export type UseCasesFactories = ReturnType<typeof createUseCasesFactories>;
