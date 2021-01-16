import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { LoadLastPriceController } from '@presentation/controllers';
import { ControllerFactory } from '@presentation/factories';

export default function (
  router: Router,
  controllerFactory: ControllerFactory<LoadLastPriceController>
): void {
  const controller = controllerFactory.make();
  router.get(
    '/price/last/:ticker',
    routeAdapter.adapt(controller)
  );
}
