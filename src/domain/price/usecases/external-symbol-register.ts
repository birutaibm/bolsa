import { SymbolDictionaryEntry } from '@domain/price/entities'
import { InvalidSymbolDictionaryEntryError } from '@errors/invalid-symbol-dictionary-entry';
import { promise } from '@utils/promise';

type SymbolDictionary = SymbolDictionaryEntry[];

export interface Worker {
  getValidSymbols: (ticker: string) => Promise<string[]>;
  register: (info: SymbolDictionaryEntry) => Promise<SymbolDictionaryEntry>;
}

export interface WorkerProvider {
  getWorker(source: string): Worker;
  getKnownSources(): string[];
}

export class ExternalSymbolRegister {
  constructor(
    private readonly workers: WorkerProvider,
  ) {}

  async registryAll(dictionary: SymbolDictionary): Promise<SymbolDictionary> {
    const promises = dictionary.map(entry => this.registry(entry));
    const { resolved } = await promise.all(promises);
    return resolved;
  }

  async registry(info: SymbolDictionaryEntry): Promise<SymbolDictionaryEntry> {
    let worker: Worker;
    try {
      worker = this.workers.getWorker(info.source);
    } catch (error) {
      throw new InvalidSymbolDictionaryEntryError(info);
    }
    await this.ensureValidSymbol(worker, info);
    return worker.register(info);
  }

  getKnownSources(): string[] {
    return this.workers.getKnownSources();
  }

  private async ensureValidSymbol(
    { getValidSymbols }: Worker,
    info: SymbolDictionaryEntry,
  ): Promise<void> {
    const validSymbols = await getValidSymbols(info.ticker);
    if (!validSymbols.includes(info.externalSymbol)) {
      throw new InvalidSymbolDictionaryEntryError(info);
    }
  }
}
