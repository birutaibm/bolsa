import { Request, Response } from 'express';

import { Controller, Params } from '@presentation/contracts';

function adaptInputField(field: {[key: string]: any}): {[key: string]: string} {
  return Object.keys(field).reduce((reduced, key) => {
    const value = field[key];
    const parsed = (typeof value === 'string') ? value : JSON.stringify(value);
    return {
      ...reduced,
      [key]: parsed,
    };
  }, {});
}

function adaptInput(req: Request): Params {
  const { body, headers, params } = req;
  const header = adaptInputField(headers);
  const query = adaptInputField(req.query);
  return {
    body,
    route: params,
    header,
    query,
  };
}

function adapt(controller: Controller) {
  return async (req: Request, res: Response) => {
    const input = adaptInput(req);
    const result = await controller.handle(input);
    return res.status(result.statusCode).json(result.data);
  }
}

export const routeAdapter = {
  adapt,
}
