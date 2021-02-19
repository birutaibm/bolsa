import { Router } from 'express';

import { Factory } from '@utils/factory';
import { LoadLastRankingController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<LoadLastRankingController>
): void {
  router.get('/ranking/last', routeAdapter.adapt(controllerFactory.make()));
}
