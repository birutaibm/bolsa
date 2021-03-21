import { NoneExternalSymbolRepository } from '@errors/none-external-symbol-repository';
import {
  RegistryExternalSymbolRepository, SearchExternalSymbolRepository,
} from '@gateway/data/contracts';
import {
  WorkerProvider, Worker
} from '@domain/price/usecases/external-symbol-register';
import { SymbolDictionaryEntryDTO } from '@gateway/data/dto';

export class ExternalSymbolRepositoryProvider implements WorkerProvider {
  constructor(
    private readonly register: RegistryExternalSymbolRepository,
    private readonly search: SearchExternalSymbolRepository[],
  ) {}

  getWorker(source: string): Worker {
    const repository = this.search.find(s => s.name === source);
    if (!repository) {
      throw new NoneExternalSymbolRepository();
    }
    const register = (entry: SymbolDictionaryEntryDTO) =>
      this.register.registryExternalSymbol(entry);
    const getValidSymbols = async (ticker: string) =>
      Object.keys(await repository.getExternalSymbols(ticker));
    return { register, getValidSymbols };
  }

  getKnownSources(): string[] {
    return this.search.map(s => s.name);
  }
}
