import { SymbolDictionaryEntry } from '@domain/price/entities'
import { InvalidSymbolDictionaryEntryError } from '@errors/invalid-symbol-dictionary-entry';
import { promise } from '@utils/promise';

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
    const promises = dictionary.map(entry => this.registry(entry));
    const { resolved } = await promise.all(promises);
    return resolved;
  }

  async registry(info: SymbolDictionaryEntry): Promise<SymbolDictionaryEntry> {
    let internalWorker: InternalWorker;
    try {
      internalWorker = this.worker.getInternalWorker(info.source);
    } catch (error) {
      throw new InvalidSymbolDictionaryEntryError(info);
    }
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
