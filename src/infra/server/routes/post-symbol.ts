import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { ControllerFactory } from '@presentation/factories';
import { ExternalSymbolRegisterController } from '@presentation/controllers';
import { externalSymbolFromBody, from, tickerFromRoute } from '@infra/server/express-input-adapter';

export default function (
  router: Router,
  controllerFactory: ControllerFactory<ExternalSymbolRegisterController>
): void {
  router.put(
    '/symbols/:ticker',
    routeAdapter.adaptWith(
      controllerFactory.make(),
      from(externalSymbolFromBody, tickerFromRoute)
    )
  );
}
