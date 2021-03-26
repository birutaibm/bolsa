import { Persisted } from '@utils/types';
import Investor from './investor';
import Position from './position';

export default class Wallet {
  private readonly positions: Array<Position & { id?: string; }> = [];
  private readonly persistedPositions: Persisted<Position>[] = [];

  constructor (
    readonly name: string,
    readonly owner: Investor,
  ) {
    owner.addWallet(this);
  }

  addPosition(position: Position): void {
    this.positions.push(position)
  }

  getPositions(): Persisted<Position>[] {
    for (let index = this.positions.length - 1; index >= 0; index--) {
      const { id } = this.positions[index];
      if (id !== undefined) {
        const persisted = this.positions.splice(index, 1)[0];
        this.persistedPositions.push(Object.assign(persisted, { id }));
      }
    }
    if (this.positions.length > 0) {
      console.warn('Wallet has some non-persisted positions');
    }
    return [...this.persistedPositions];
  }
};
