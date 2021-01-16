import { LastPriceLoader } from '@domain/usecases';
import { Controller, ok, Params, Response, serverError } from '@presentation/contracts';
import { Price } from '@presentation/view';

export class LoadLastPriceController implements Controller {
  constructor(
    private readonly lastPriceLoader: LastPriceLoader
  ) {}

  async handle({route}: Params): Promise<Response<Price>> {
    const ticker = route?.ticker;
    if (!ticker) {
      return serverError(new Error('Can not find ticker at route'));
    }
    try {
      const price = await this.lastPriceLoader.load(ticker);
      const data = Price.fromEntity(price);
      return ok(data);
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
