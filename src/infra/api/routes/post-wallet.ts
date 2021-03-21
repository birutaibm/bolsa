import { Router } from 'express';

import { Factory } from '@utils/factory';
import { WalletCreatorController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<WalletCreatorController>,
): void {
  router.post(
    '/wallets',
    routeAdapter.adapt(controllerFactory.make())
  );
}
