import { SymbolDictionaryEntry } from "@domain/entities"

export interface ExternalSymbolRegister {
  getKnownSources: () => string[];
  registry: (info: SymbolDictionaryEntry) => Promise<SymbolDictionaryEntry>
}
