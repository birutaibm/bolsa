export class InvalidUserPasswordError extends Error {
  constructor() {
    super('Invalid username and/or password');
    this.name = 'InvalidUserPasswordError';
  }
}
