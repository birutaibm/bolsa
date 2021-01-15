import { SymbolDictionaryEntry } from "@domain/entities"

export interface ExternalSymbolRegister {
  registry: (info: SymbolDictionaryEntry) => Promise<SymbolDictionaryEntry>
}
