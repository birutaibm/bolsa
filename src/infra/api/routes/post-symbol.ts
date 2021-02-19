import { Router } from 'express';

import { Factory } from '@utils/factory';
import { ExternalSymbolRegisterController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<ExternalSymbolRegisterController>,
): void {
  router.put(
    '/symbols/:ticker',
    routeAdapter.adapt(controllerFactory.make())
  );
}
