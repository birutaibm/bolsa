import { Router } from 'express';

import {
  UserCreatorControllerFactory
} from '@gateway/presentation/factories';
import routeAdapter from '@infra/adapters/express-router-adapter';

export default function (
  router: Router,
  controllerFactory: UserCreatorControllerFactory
): void {
  router.post(
    '/users',
    routeAdapter.adapt(controllerFactory.make())
  );
}
