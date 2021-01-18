import { Price } from "@domain/entities"

export interface ExternalPriceRegister {
  registry: (ticker: string) => Promise<Price[]>
}
