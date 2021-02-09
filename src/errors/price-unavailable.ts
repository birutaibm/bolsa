export class PriceUnavailableError extends Error {
  private readonly causes: Error[];

  constructor(ticker: string, ...causes: Error[]) {
    super(`Price of ${ticker} unavailable`);
    this.name = 'PriceUnavailableError';
    this.causes = causes;
  }
}
