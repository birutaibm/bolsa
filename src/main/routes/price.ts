import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { LoadLastPriceController } from '@presentation/controllers';
import { makeLoadLastPriceController } from '@main/factories';
import { tickerFromRoute } from '@infra/server/express-input-adapter';

export default function (router: Router): void {
  const controller: LoadLastPriceController = makeLoadLastPriceController();
  router.get(
    '/price/last/:ticker',
    routeAdapter.adaptWith(controller, tickerFromRoute)
  );
}
