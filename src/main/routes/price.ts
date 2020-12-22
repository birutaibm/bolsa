import { Request, Router } from 'express';

import { routeAdapter } from '@main/adapters';
import { makeLoadLastPriceController } from '@main/factories';
import { LoadLastPriceController } from '@presentation/controllers';

export default function (router: Router): void {
  const controller: LoadLastPriceController = makeLoadLastPriceController();
  const inputAdapter = (req: Request) => ({ticker: req.params.ticker})
  router.get('/price/last/:ticker', routeAdapter.adaptWith(controller, inputAdapter));
}
