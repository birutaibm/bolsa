import { Response, Params } from '@presentation/contracts';

export interface Controller {
  handle: (params: Params) => Promise<Response>
}
