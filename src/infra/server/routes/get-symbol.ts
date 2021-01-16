import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { ControllerFactory } from '@presentation/factories';
import { ExternalSymbolSearchController } from '@presentation/controllers';

export default function (
  router: Router,
  controllerFactory: ControllerFactory<ExternalSymbolSearchController>
): void {
  router.get(
    '/symbols/:ticker',
    routeAdapter.adapt(controllerFactory.make())
  );
}
