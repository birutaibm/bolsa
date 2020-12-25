import { Router } from 'express';

import { routeAdapter } from '@infra/server/express-router';
import { makeLoadLastRankingController } from '@main/factories';

export default function (router: Router): void {
  const controller = makeLoadLastRankingController();
  router.get('/ranking/last', routeAdapter.adapt(controller));
}
