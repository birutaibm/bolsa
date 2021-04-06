export class InvalidParameterValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidParameterValueError';
  }
}
