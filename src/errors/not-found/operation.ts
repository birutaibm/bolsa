export class OperationNotFoundError extends Error {
  constructor(id: string) {
    super(`Operation ${id} not found`);
    this.name = 'OperationNotFoundError';
  }
}
