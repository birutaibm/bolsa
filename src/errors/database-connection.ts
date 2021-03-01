export class DatabaseConnectionError extends Error {
  constructor(databaseName: string) {
    super(`Something went wrong connecting ${databaseName}`);
    this.name = 'DatabaseConnectionError';
  }
}
