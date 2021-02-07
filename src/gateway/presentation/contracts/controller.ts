import { Response, Params } from '@gateway/presentation/contracts';

export interface Controller {
  handle(params: Params): Promise<Response>;
}
