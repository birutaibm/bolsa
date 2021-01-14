import { SymbolDictionaryEntry } from "@domain/entities";

export interface SymbolDictionaryEntryCreator {
  create: (data: SymbolDictionaryEntry) => Promise<SymbolDictionaryEntry>;
}
