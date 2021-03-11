import { Router } from 'express';

import { Factory } from '@utils/factory';
import { OperationLoaderController } from '@gateway/presentation/controllers';

import routeAdapter from './adapter';

export default function (
  router: Router,
  controllerFactory: Factory<OperationLoaderController>,
): void {
  router.get(
    '/operations/:id',
    routeAdapter.adapt(controllerFactory.make())
  );
}


