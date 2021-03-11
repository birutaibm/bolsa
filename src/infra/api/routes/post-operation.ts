import { Router } from 'express';

import { Factory } from '@utils/factory';
import { OperationCreatorController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<OperationCreatorController>,
): void {
  router.post(
    '/operations',
    routeAdapter.adapt(controllerFactory.make())
  );
}
