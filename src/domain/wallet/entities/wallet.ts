import { Persisted } from '@utils/types';
import Investor from './investor';
import Position from './position';

export default class Wallet {
  private readonly positions: Position[] = [];

  constructor (
    readonly id: string,
    readonly name: string,
    readonly owner: Investor,
  ) {
    owner.addWallet(this);
  }

  addPosition(position: Position): void {
    this.positions.push(position)
  }

  getPositions(): Persisted<Position>[] {
    return [...this.positions];
  }
};
