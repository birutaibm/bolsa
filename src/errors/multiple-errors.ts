export class MultipleErrors extends Error {
  constructor(
    private readonly errors: Error[]
  ) {
    super(`You have ${errors.length} errors: ${errors.map(error => error.message)}`);
    this.name = 'MultipleErrors';
  }
}
