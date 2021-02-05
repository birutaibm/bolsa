import { Router } from 'express';

import {
  ExternalSymbolRegisterControllerFactory
} from '@gateway/presentation/factories';
import routeAdapter from '@infra/adapters/express-router-adapter';

export default function (
  router: Router,
  controllerFactory: ExternalSymbolRegisterControllerFactory
): void {
  router.put(
    '/symbols/:ticker',
    routeAdapter.adapt(controllerFactory.make())
  );
}
