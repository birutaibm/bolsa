export default class NotFoundError extends Error {
  constructor(resource: string, identification: string) {
    super(`${resource} ${identification} not found`);
  }
}

export { AssetNotFoundError } from './asset';
export { UserNotFoundError } from './user';
export { InvestorNotFoundError } from './investor';
export { WalletNotFoundError } from './wallet';
export { PositionNotFoundError } from './position';
export { OperationNotFoundError } from './operation';
