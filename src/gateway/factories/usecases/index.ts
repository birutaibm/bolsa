import { Factory } from '@utils/factory';

import {
  RepositoryFactories
} from '@gateway/factories';
import Security from '@gateway/security';

import createPriceUseCasesFactories from './price';
import createUserUseCasesFactories from './user';
import createWalletUseCasesFactories from './wallet';

export function createUseCasesFactories(
  { prices, users, wallets }: RepositoryFactories,
  security: Factory<Security>,
) {
  const priceUseCases = createPriceUseCasesFactories(prices.make());
  const userUseCases = createUserUseCasesFactories(users.make(), security.make());
  const walletUseCases = createWalletUseCasesFactories(wallets.make());

  return {
    price: priceUseCases,
    user: userUseCases,
    wallet: walletUseCases,
  };
}

export type UseCasesFactories = ReturnType<typeof createUseCasesFactories>;
