import { Router } from 'express';

import { LoadLastRankingControllerFactory } from '@gateway/presentation/factories';
import routeAdapter from '@infra/adapters/express-router-adapter';

export default function (
  router: Router,
  controllerFactory: LoadLastRankingControllerFactory
): void {
  router.get('/ranking/last', routeAdapter.adapt(controllerFactory.make()));
}
