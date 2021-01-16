import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { ControllerFactory } from '@presentation/factories';
import { ExternalSymbolRegisterController } from '@presentation/controllers';

export default function (
  router: Router,
  controllerFactory: ControllerFactory<ExternalSymbolRegisterController>
): void {
  router.put(
    '/symbols/:ticker',
    routeAdapter.adapt(controllerFactory.make())
  );
}
