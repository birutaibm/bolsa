import { WorkerProvider } from '@domain/price/usecases/external-symbol-register';

import { SymbolDictionaryEntryDTO } from '@gateway/data/dto';

export class ExternalSymbolRegisterFunctionalities implements WorkerProvider {
  constructor(private readonly available: {[source: string]: string[]}) {}

  getKnownSources() {
    return Object.keys(this.available);
  }

  getWorker(source: string) {
    if (!this.available[source])
      throw new Error();
    return {
      getValidSymbols: () => this.available[source],

      register: (info: SymbolDictionaryEntryDTO) => {
        if (info.source !== source) {
          throw new Error();
        }
        if (!this.available[source].includes(info.externalSymbol)) {
          throw new Error();
        }
        return {...info, id: info.ticker};
      },
    };
  }
}
