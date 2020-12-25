export class ExternalPriceLoaderError extends Error {
  constructor(public readonly externalSourceName: string, message: string) {
    super(message);
    this.name = 'ExternalPriceLoaderError';
  }
}
