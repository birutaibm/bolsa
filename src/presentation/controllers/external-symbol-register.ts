import { promise } from "@data/utils";
import { SymbolDictionaryEntry } from "@domain/entities";
import { ExternalSymbolRegister } from "@domain/usecases";
import { Controller, created, Response, serverError } from "@presentation/contracts";

type InputDTO = {
  ticker: string;
  [source: string]: string; // each source refers to one symbol
}

export class ExternalSymbolRegisterController implements Controller<InputDTO> {
  constructor(
    private readonly useCase: ExternalSymbolRegister,
  ) {}

  async handle(data: InputDTO): Promise<Response<SymbolDictionaryEntry[]>> {
    const { ticker } = data;
    const dictionary: SymbolDictionaryEntry[] = Object.keys(data)
      .filter(key => key !== 'ticker')
      .map(source => ({
        ticker,
        source,
        externalSymbol: data[source],
      }));
    const promises = dictionary.map(entry =>
      promise.noRejection(() => this.useCase.registry(entry))
    );
    try {
      const result = await Promise.all(promises);
      const success = result.filter(entry => Object.keys(entry).length !== 0);
      return created(success);
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
