export class SignInRequiredError extends Error {
  constructor() {
    super('It appears you are not logged in, but you need login to do this operation');
    this.name = 'SignInRequiredError';
  }
}
