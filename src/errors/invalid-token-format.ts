export class InvalidTokenFormatError extends Error {
  constructor() {
    super('Invalid token format');
    this.name = 'InvalidTokenFormatError';
  }
}
