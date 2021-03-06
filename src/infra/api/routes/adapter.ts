import { Request, Response } from 'express';

import { Controller, Params } from '@gateway/presentation/contracts';

type Field = { [key: string]: undefined | string | string[] | Field | Field[] };

function adaptInputField(field: Field): {[key: string]: string} {
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
    ...body,
    ...query,
    ...params,
    ...header,
  };
}

function adapt(controller: Controller) {
  return async (req: Request, res: Response) => {
    const input = adaptInput(req);
    const result = await controller.handle(input);
    return res.status(result.statusCode).json(result.data);
  }
}

const routeAdapter = {
  adapt,
};

export default routeAdapter;
