import { SymbolDictionaryEntry } from '@domain/entities'
import { InvalidSymbolDictionaryEntryError } from '@domain/errors';
import { promise } from '@domain/utils';

type SymbolDictionary = SymbolDictionaryEntry[];

interface InternalWorker {
  getValidSymbols: (ticker: string) => Promise<string[]>;
  register: (info: SymbolDictionaryEntry) => Promise<SymbolDictionaryEntry>;
}

export interface RequiredFunctionalities<W extends InternalWorker> {
  getInternalWorker(source: string): W;
  getKnownSources(): string[];
}

export class ExternalSymbolRegister {
  constructor(
    private readonly worker: RequiredFunctionalities<InternalWorker>,
  ) {}

  async registryAll(dictionary: SymbolDictionary): Promise<SymbolDictionary> {
    const promises = dictionary.map(entry =>
      promise.noRejection(() => this.registry(entry))
    );
    const results = await Promise.all(promises);
    const result = results.filter(entry => Object.keys(entry).length !== 0);
    return result;
  }

  async registry(info: SymbolDictionaryEntry): Promise<SymbolDictionaryEntry> {
    const internalWorker = this.worker.getInternalWorker(info.source);
    await this.ensureValidSymbol(internalWorker, info);
    return internalWorker.register(info);
  }

  getKnownSources(): string[] {
    return this.worker.getKnownSources();
  }

  private async ensureValidSymbol(
    { getValidSymbols }: InternalWorker,
    info: SymbolDictionaryEntry,
  ): Promise<void> {
    const validSymbols = await getValidSymbols(info.ticker);
    if (!validSymbols.includes(info.externalSymbol)) {
      throw new InvalidSymbolDictionaryEntryError(info);
    }
  }
}
