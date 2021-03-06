import { UseCasesFactories } from '@gateway/factories/usecases';

import { createUserControllers } from './user-controllers'
import { createPriceControllers } from './price-controllers';
import { createWalletControllers } from './wallet-controllers';

export function createControllerFactories(
  useCasesFactories: UseCasesFactories,
) {
  const priceControllers = createPriceControllers(
    useCasesFactories.price,
    useCasesFactories.user.authorization,
  );
  const userControllers = createUserControllers(useCasesFactories.user);
  const walletControllers = createWalletControllers(
    useCasesFactories.wallet,
    useCasesFactories.user.authorization,
  );

  return {
    ...priceControllers,
    ...userControllers,
    ...walletControllers,
  };
}
