import { SymbolDictionaryEntry } from "@domain/entities"

export type ExternalSymbolsDTO = {
  [symbol: string]: StringMap;
}

type StringMap = {
  [key: string]: string;
}

export type SymbolDictionaryEntryDTO = SymbolDictionaryEntry;
