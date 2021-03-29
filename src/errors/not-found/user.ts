import NotFoundError from '.';

export class UserNotFoundError extends NotFoundError {
  constructor(username: string) {
    super('User', username);
    this.name = 'UserNotFoundError';
  }
}
