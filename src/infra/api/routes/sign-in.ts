import { Router } from 'express';

import {
  SignInControllerFactory
} from '@gateway/presentation/factories';
import routeAdapter from '@infra/adapters/express-router-adapter';

export default function (
  router: Router,
  controllerFactory: SignInControllerFactory
): void {
  router.post(
    '/sessions',
    routeAdapter.adapt(controllerFactory.make())
  );
}
