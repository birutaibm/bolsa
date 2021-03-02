import Position from './position';

export type User = {
  name: string;
};

export default class Wallet {
  constructor (
    readonly name: string,
    readonly owner: User,
    private readonly positions: Position[] = [],
  ) {}

  addPosition(position: Position): void {
    this.positions.push(position)
  }

  getPositions(): Position[] {
    return [...this.positions];
  }
};
