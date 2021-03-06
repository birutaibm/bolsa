import { Factory } from '@utils/factory';

import {
  RepositoryFactories
} from '@gateway/factories';
import { ISecurity } from '@gateway/security';

import createPriceUseCasesFactories from './price';
import createUserUseCasesFactories from './user';
import createWalletUseCasesFactories from './wallet';

export function createUseCasesFactories(
  {
    prices, users, investors, wallets, positions, operations,
  }: RepositoryFactories,
  security: Factory<ISecurity>,
) {
  const priceUseCases = createPriceUseCasesFactories(prices.make());
  const userUseCases = createUserUseCasesFactories(users.make(), security.make());
  const changers = wallets.make().getChangeCommandExecutors();
  const walletUseCases = createWalletUseCasesFactories(
    investors.make(), wallets.make(), positions.make(), operations.make(),
    prices.make().internal, changers,
  );

  return {
    price: priceUseCases,
    user: userUseCases,
    wallet: walletUseCases,
  };
}

export type UseCasesFactories = ReturnType<typeof createUseCasesFactories>;
