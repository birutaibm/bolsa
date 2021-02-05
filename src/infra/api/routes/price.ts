import { Router } from 'express';

import { LoadLastPriceControllerFactory } from '@gateway/presentation/factories';
import routeAdapter from '@infra/adapters/express-router-adapter';

export default function (
  router: Router,
  controllerFactory: LoadLastPriceControllerFactory
): void {
  const controller = controllerFactory.make();
  router.get(
    '/price/last/:ticker',
    routeAdapter.adapt(controller)
  );
}
