import { Router } from 'express';

import { Factory } from '@utils/factory';
import { UserCreatorController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<UserCreatorController>,
): void {
  router.post(
    '/users',
    routeAdapter.adapt(controllerFactory.make())
  );
}
