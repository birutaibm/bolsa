import { LastPriceLoader } from '@domain/usecases';
import { Controller, ok, Response, serverError } from '@presentation/contracts';
import { Price } from '@presentation/view';

type InputDTO = {
  ticker: string;
}

export class LoadLastPriceController implements Controller<InputDTO> {
  constructor(
    private readonly lastPriceLoader: LastPriceLoader
  ) {}

  async handle({ticker}: InputDTO): Promise<Response<Price>> {
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
