import { Router } from 'express';

import { routeAdapter } from '@main/adapters';
import { makeLoadLastRankingController } from '@main/factories';

export default function (router: Router): void {
  const controller = makeLoadLastRankingController();
  router.get('/ranking/last', routeAdapter.adapt(controller));
}
