import { SymbolDictionaryEntry } from '@domain/price/entities';

export class InvalidSymbolDictionaryEntryError extends Error {
  constructor(info: SymbolDictionaryEntry) {
    super(`Symbol ${info.externalSymbol} of ${info.source} is invalid for ticker ${info.ticker}`);
    this.name = 'InvalidSymbolDictionaryEntryError';
  }
}
