import { LoadPriceRepository, LoadExternalPriceRepository, SavePriceFromExternalRepository, ExternalSymbolDictionary } from "@data/contracts";
import { PriceDTO } from "@data/dto";
import { PriceUnavailableError } from "@domain/errors";

export class ExternalPriceRepository implements LoadPriceRepository {
  private readonly externalSymbolDictionary: ExternalSymbolDictionary[];

  constructor(
    private readonly externalName: string,
    private readonly externalPriceLoader: LoadExternalPriceRepository,
    private readonly internalPriceSaver: SavePriceFromExternalRepository,
    ...externalSymbolDictionary: ExternalSymbolDictionary[]
  ) {
    this.externalSymbolDictionary = externalSymbolDictionary;
  }

  private async getSymbolOf(ticker: string, dictionaryIndex = 0): Promise<string> {
    try {
      return await this.externalSymbolDictionary[dictionaryIndex]
        .getExternalSymbol(ticker, this.externalName);
    } catch (error) {
      const index = dictionaryIndex + 1;
      if (index >= this.externalSymbolDictionary.length) {
        throw error;
      }
      return this.getSymbolOf(ticker, index);
    }
  }

  async loadPriceByTicker(ticker: string): Promise<PriceDTO[]> {
    const symbol = await this.getSymbolOf(ticker);
    const prices = await this.externalPriceLoader.loadPriceBySymbol(symbol);
    if (prices && prices.length) {
      return this.internalPriceSaver.save(
        this.externalName,
        symbol,
        prices.map(price => ({ ...price, ticker, name: ticker})),
      );
    }
    throw new PriceUnavailableError(ticker)
  }
}
