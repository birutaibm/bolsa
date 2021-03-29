import NotFoundError from '.';

export class PositionNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Position', id);
    this.name = 'PositionNotFoundError';
  }
}
