import { Router } from 'express';

import { ExternalSymbolSearchControllerFactory } from '@gateway/presentation/factories';
import routeAdapter from '@infra/adapters/express-router-adapter';

export default function (
  router: Router,
  controllerFactory: ExternalSymbolSearchControllerFactory
): void {
  router.get(
    '/symbols/:ticker',
    routeAdapter.adapt(controllerFactory.make())
  );
}
