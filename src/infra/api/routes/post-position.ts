import { Router } from 'express';

import { Factory } from '@utils/factory';
import { PositionCreatorController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<PositionCreatorController>,
): void {
  router.post(
    '/positions',
    routeAdapter.adapt(controllerFactory.make())
  );
}
