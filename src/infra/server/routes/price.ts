import { Router } from 'express';

import { LoadLastPriceController } from '@presentation/controllers';
import { ControllerFactory } from '@presentation/factories';
import { routeAdapter } from '@infra/server/express-router';
import { tickerFromRoute } from '@infra/server/express-input-adapter';

export default function (
  router: Router,
  controllerFactory: ControllerFactory<LoadLastPriceController>
): void {
  router.get(
    '/price/last/:ticker',
    routeAdapter.adaptWith(controllerFactory.make(), tickerFromRoute)
  );
}
