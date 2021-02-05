import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import {
  ExternalSymbolRegisterControllerFactory
} from '@presentation/factories';

export default function (
  router: Router,
  controllerFactory: ExternalSymbolRegisterControllerFactory
): void {
  router.put(
    '/symbols/:ticker',
    routeAdapter.adapt(controllerFactory.make())
  );
}
