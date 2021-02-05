export class AssetNotFoundError extends Error {
  constructor(ticker: string) {
    super(`Ticker ${ticker} not found`);
    this.name = 'AssetNotFoundError';
  }
}
