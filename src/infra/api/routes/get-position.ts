import { Router } from 'express';

import { Factory } from '@utils/factory';
import { PositionLoaderController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<PositionLoaderController>,
): void {
  router.get(
    '/positions/:id',
    routeAdapter.adapt(controllerFactory.make())
  );
}
