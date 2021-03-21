import { Router } from 'express';

import { Factory } from '@utils/factory';
import { InvestorCreatorController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<InvestorCreatorController>,
): void {
  router.post(
    '/investors',
    routeAdapter.adapt(controllerFactory.make())
  );
}
