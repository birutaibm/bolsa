import { Router } from 'express';

import { Factory } from '@utils/factory';
import { LoadLastRankingController } from '@gateway/presentation/controllers';
import routeAdapter from '@infra/adapters/express-router-adapter';

export default function (
  router: Router,
  controllerFactory: Factory<LoadLastRankingController>
): void {
  router.get('/ranking/last', routeAdapter.adapt(controllerFactory.make()));
}
