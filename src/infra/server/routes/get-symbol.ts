import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { ExternalSymbolSearchControllerFactory } from '@presentation/factories';

export default function (
  router: Router,
  controllerFactory: ExternalSymbolSearchControllerFactory
): void {
  router.get(
    '/symbols/:ticker',
    routeAdapter.adapt(controllerFactory.make())
  );
}
