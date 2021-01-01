import { Request, Response } from 'express';

import { Controller } from '@presentation/contracts';
import { ExpressInputAdapter } from '@infra/server/express-input-adapter';

const voidInputAdapter: ExpressInputAdapter<void> = (_: Request) => {};

function adapt<T>(controller: Controller<T>, adaptInput: ExpressInputAdapter<T>) {
  console.log('create route from controller');
  return async (req: Request, res: Response) => {
    const input = adaptInput(req);
    const result = await controller.handle(input);
    return res.status(result.statusCode).json(result.data);
  }
}

export const routeAdapter = {
  adapt: (controller: Controller<void>) => adapt(controller, voidInputAdapter),
  adaptWith: adapt,
}
