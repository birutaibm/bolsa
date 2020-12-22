export class PriceUnavailableError extends Error {
  constructor(ticker: string) {
    super(`Price of ${ticker} unavailable`);
    this.name = 'PriceUnavailableError';
  }
}
