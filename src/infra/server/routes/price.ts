import { Request, Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { LoadLastPriceController } from '@presentation/controllers';
import { ControllerFactory } from '@presentation/factories';

export default function (
  router: Router,
  controllerFactory: ControllerFactory<LoadLastPriceController>
): void {
  const controller = controllerFactory.make();
  const inputAdapter = (req: Request) => ({ticker: req.params.ticker});
  router.get('/price/last/:ticker', routeAdapter.adaptWith(controller, inputAdapter));
}
