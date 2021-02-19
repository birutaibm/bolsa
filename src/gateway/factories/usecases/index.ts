import { Factory } from '@utils/factory';

import {
  RepositoryFactories
} from '@gateway/factories';
import Security from '@gateway/security';

import createPriceUseCasesFactories from './price';
import createUserUseCasesFactories from './user';

export function createUseCasesFactories(
  { prices, user }: RepositoryFactories,
  security: Factory<Security>,
) {
  const priceUseCases = createPriceUseCasesFactories(prices.make());
  const userUseCases = createUserUseCasesFactories(user.make(), security.make());

  return {
    price: priceUseCases,
    user : userUseCases,
  };
}

export type UseCasesFactories = ReturnType<typeof createUseCasesFactories>;
