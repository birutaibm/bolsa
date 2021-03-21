export class PositionNotFoundError extends Error {
  constructor(id: string) {
    super(`Position ${id} not found`);
    this.name = 'PositionNotFoundError';
  }
}
