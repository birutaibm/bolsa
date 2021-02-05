export class ExternalSymbolNotFoundError extends Error {
  constructor(externalLibrary: string, ticker: string) {
    super(`Ticker ${ticker} not found at library ${externalLibrary}`);
    this.name = 'ExternalSymbolNotFoundError';
  }
}
