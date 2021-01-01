import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { LoadLastPriceController } from '@presentation/controllers';
import { ControllerFactory } from '@presentation/factories';
import { tickerFromRoute } from '@infra/server/express-input-adapter';

export default function (
  router: Router,
  controllerFactory: ControllerFactory<LoadLastPriceController>
): void {
  const controller = controllerFactory.make();
  router.get(
    '/price/last/:ticker',
    routeAdapter.adaptWith(controller, tickerFromRoute)
  );
}
