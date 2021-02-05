import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { LoadLastPriceControllerFactory } from '@presentation/factories';

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
