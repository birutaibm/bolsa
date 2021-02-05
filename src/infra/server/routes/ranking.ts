import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { LoadLastRankingControllerFactory } from '@presentation/factories';

export default function (
  router: Router,
  controllerFactory: LoadLastRankingControllerFactory
): void {
  router.get('/ranking/last', routeAdapter.adapt(controllerFactory.make()));
}
