import { Request, Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { LoadLastPriceController } from '@presentation/controllers';
import { makeLoadLastPriceController } from '@main/factories';

export default function (router: Router): void {
  const controller: LoadLastPriceController = makeLoadLastPriceController();
  const inputAdapter = (req: Request) => ({ticker: req.params.ticker});
  router.get('/price/last/:ticker', routeAdapter.adaptWith(controller, inputAdapter));
}
