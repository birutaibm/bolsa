import Investor from './investor';
import Position from './position';

export default class Wallet {
  constructor (
    readonly name: string,
    readonly owner: Investor,
    private readonly positions: Position[] = [],
  ) {
    owner.addWallet(this);
  }

  addPosition(position: Position): void {
    this.positions.push(position)
  }

  getPositions(): Position[] {
    return [...this.positions];
  }
};
