import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { ControllerFactory } from '@presentation/factories';
import { ExternalSymbolSearchController } from '@presentation/controllers';
import { tickerFromRoute } from '@infra/server/express-input-adapter';

export default function (
  router: Router,
  controllerFactory: ControllerFactory<ExternalSymbolSearchController>
): void {
  router.get(
    '/symbols/:ticker',
    routeAdapter.adaptWith(controllerFactory.make(), tickerFromRoute)
  );
}
