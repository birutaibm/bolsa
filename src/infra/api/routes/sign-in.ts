import { Router } from 'express';

import { Factory } from '@utils/factory';
import { SignInController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<SignInController>
): void {
  router.post(
    '/sessions',
    routeAdapter.adapt(controllerFactory.make())
  );
}
