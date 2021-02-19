import { Router } from 'express';

import { Factory } from '@utils/factory';
import { ExternalSymbolSearchController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<ExternalSymbolSearchController>
): void {
  router.get(
    '/symbols/:ticker',
    routeAdapter.adapt(controllerFactory.make())
  );
}
