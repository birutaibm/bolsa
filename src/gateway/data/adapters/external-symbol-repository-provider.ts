import { NoneExternalSymbolRepository } from '@errors/none-external-symbol-repository';
import {
  ExternalSymbolRepositories,
} from '@gateway/data/contracts';
import {
  WorkerProvider, Worker
} from '@domain/price/usecases/external-symbol-register';
import { SymbolDictionaryEntryDTO } from '@gateway/data/dto';

export class ExternalSymbolRepositoryProvider implements WorkerProvider {
  constructor(
    private readonly repositories: ExternalSymbolRepositories,
  ) {}

  getWorker(source: string): Worker {
    const repository = this.repositories[source];
    if (!repository) {
      throw new NoneExternalSymbolRepository();
    }
    const register = (entry: SymbolDictionaryEntryDTO) =>
      repository.register.registryExternalSymbol(entry);
    const getValidSymbols = async (ticker: string) =>
      Object.keys(await repository.search.getExternalSymbols(ticker));
    return { register, getValidSymbols };
  }

  getKnownSources(): string[] {
    return Object.keys(this.repositories);
  }
}
