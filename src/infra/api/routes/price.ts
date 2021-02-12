import { Router } from 'express';

import { Factory } from '@utils/factory';
import { LoadLastPriceController } from '@gateway/presentation/controllers';
import routeAdapter from '@infra/adapters/express-router-adapter';

export default function (
  router: Router,
  controllerFactory: Factory<LoadLastPriceController>
): void {
  const controller = controllerFactory.make();
  router.get(
    '/price/last/:ticker',
    routeAdapter.adapt(controller)
  );
}
