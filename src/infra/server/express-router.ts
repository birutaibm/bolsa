import { Request, Response } from 'express';

import { Controller } from '@presentation/contracts';
import { ControllerInputAdapter } from '@infra/server/controller-input-adapter';

export const routeAdapter = {
  adapt(controller: Controller<void>) {
    return async (req: Request, res: Response) => {
      const result = await controller.handle();
      return res.status(result.statusCode).json(result.data);
    }
  },

  adaptWith<T>(controller: Controller<T>, adaptInput: ControllerInputAdapter<T>) {
    return async (req: Request, res: Response) => {
      const input = adaptInput(req);
      const result = await controller.handle(input);
      return res.status(result.statusCode).json(result.data);
    }
  },
}
