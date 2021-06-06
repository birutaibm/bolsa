import NotFoundError from './base';

export class AssetNotFoundError extends NotFoundError {
  constructor(ticker: string) {
    super('Asset', ticker);
    this.name = 'AssetNotFoundError';
  }
}
