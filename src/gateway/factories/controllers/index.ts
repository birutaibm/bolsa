import { UseCasesFactories } from '@gateway/factories/usecases';

import { createRankingControllers } from './ranking-controllers'
import { createUserControllers } from './user-controllers'
import { createPriceControllers } from './price-controllers';

export function createControllerFactories(
  useCasesFactories: UseCasesFactories,
) {
  const rankingControllers = createRankingControllers(useCasesFactories.ranking);
  const priceControllers = createPriceControllers(useCasesFactories.price);
  const userControllers = createUserControllers(useCasesFactories.user);

  return {
    ...priceControllers,
    ...userControllers,
    ranking: rankingControllers.load,
  };
}
