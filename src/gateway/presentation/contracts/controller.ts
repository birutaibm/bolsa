import { Response, Params } from '@gateway/presentation/contracts';
import { MayBePromise } from '@utils/types';
import { error } from './response';

export abstract class Controller {
  async handle(params: Params): Promise<Response> {
    try {
      return await this.tryHandle(params);
    } catch (err) {
      return error(err);
    }
  }

  protected abstract tryHandle(params: Params): MayBePromise<Response>
}
