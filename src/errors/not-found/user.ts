import NotFoundError from './base';

export class UserNotFoundError extends NotFoundError {
  constructor(username: string) {
    super('User', username);
    this.name = 'UserNotFoundError';
  }
}
