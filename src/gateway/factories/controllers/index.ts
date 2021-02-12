import { Factory } from '@utils/factory';

import {
  RepositoryFactories
} from '@gateway/factories';
import Security from '@gateway/security';

import { createRankingControllers } from './ranking-controllers'
import { createUserControllers } from './user-controllers'
import { createPriceControllers } from './price-controllers';

export function createControllerFactories(
  repositories: RepositoryFactories,
  securityFactory: Factory<Security>,
) {
  const rankingControllers = createRankingControllers(repositories.ranking);
  const priceControllers = createPriceControllers(repositories.prices);
  const userControllers = createUserControllers(
    repositories.user,
    securityFactory
  );

  return {
    ...priceControllers,
    ...userControllers,
    ranking: rankingControllers.load,
  };
}
