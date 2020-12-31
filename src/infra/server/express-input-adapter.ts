import { Request } from "express";

export type ExpressInputAdapter<T> = (req: Request) => T;

export function from<T1, T2>(
  t1: ExpressInputAdapter<T1>,
  t2: ExpressInputAdapter<T2>,
): ExpressInputAdapter<T1 & T2> {
  return (req: Request) => ({
    ...t1(req),
    ...t2(req),
  });
}

export const tickerFromRoute = (req: Request) => ({ticker: req.params.ticker});
