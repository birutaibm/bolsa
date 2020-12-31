import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { ControllerFactory } from '@presentation/factories';
import { LoadLastRankingController } from '@presentation/controllers';

export default function (
  router: Router,
  controllerFactory: ControllerFactory<LoadLastRankingController>
): void {
  const controller = controllerFactory.make();
  router.get('/ranking/last', routeAdapter.adapt(controller));
}
