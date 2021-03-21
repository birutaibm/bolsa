import { Router } from 'express';

import { Factory } from '@utils/factory';
import { InvestorLoaderController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<InvestorLoaderController>,
): void {
  router.get(
    '/investors/:id',
    routeAdapter.adapt(controllerFactory.make())
  );
}
