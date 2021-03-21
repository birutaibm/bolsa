export class DatabaseOperationError extends Error {
  constructor(databaseOperation: string) {
    super(`Something went wrong on ${databaseOperation}`);
    this.name = 'DatabaseOperationError';
  }
}
