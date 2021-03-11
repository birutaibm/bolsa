import { Router } from 'express';

import { Factory } from '@utils/factory';
import { WalletLoaderController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<WalletLoaderController>,
): void {
  router.get(
    '/wallets/:id',
    routeAdapter.adapt(controllerFactory.make())
  );
}
