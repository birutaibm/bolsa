import NotFoundError from "./base";

export class ExternalSymbolNotFoundError extends NotFoundError {
  constructor(externalLibrary: string, ticker: string) {
    super('Ticker', ticker);
    this.message = super.message + ` at library ${externalLibrary}`;
    this.name = 'ExternalSymbolNotFoundError';
  }
}
