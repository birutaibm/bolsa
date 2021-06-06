import NotFoundError from './base';

export class OperationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Operation', id);
    this.name = 'OperationNotFoundError';
  }
}
