import { NoneExternalSymbolRepository } from '@errors/none-external-symbol-repository';
import {
  ExternalSymbolRepositories,
  ExternalSymbolRepository,
} from '@gateway/data/contracts';
import {
  RequiredFunctionalities
} from '@domain/price/usecases/external-symbol-register';
import { SymbolDictionaryEntryDTO } from '@gateway/data/dto';

type TypeOfMember<T, M extends keyof T> = T[M];

interface Worker {
  register: TypeOfMember<
    TypeOfMember<ExternalSymbolRepository, 'register'>,
    'registryExternalSymbol'
  >;
  getValidSymbols: (ticker: string) => Promise<string[]>;
};

export class ExternalSymbolRegisterFunctionalities implements RequiredFunctionalities<Worker> {
  constructor(
    private readonly repositories: ExternalSymbolRepositories,
  ) {}

  getInternalWorker(source: string): Worker {
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
