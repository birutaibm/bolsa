import { Request, Response } from 'express';

import { Controller, Params } from '@presentation/contracts';

function adaptInput(req: Request): Params {
  const { body, headers, params } = req;
  const header = Object.keys(headers).reduce((reduced, key) => {
    const value = headers[key];
    const parsed = (typeof value === 'string') ? value : JSON.stringify(value);
    return {
      ...reduced,
      [key]: parsed,
    };
  }, {});
  const query = Object.keys(req.query).reduce((reduced, key) => {
    const value = req.query[key];
    const parsed = (typeof value === 'string') ? value : JSON.stringify(value);
    return {
      ...reduced,
      [key]: parsed,
    };
  }, {});
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
