import { Persisted } from '@utils/types';
import Operation from './operation';
import Wallet from './wallet';

export type Asset = {
  readonly ticker: string;
  readonly name: string;
};

export default class Position {
  private readonly operations: Array<Operation & { id?: string; }> = [];
  private readonly persistedOperations: Persisted<Operation>[] = [];

  constructor(
    readonly asset: Persisted<Asset>,
    readonly wallet: Persisted<Wallet>,
  ) {
    wallet.addPosition(this);
  }

  addOperation(operation: Operation) {
    this.operations.push(operation);
  }

  // TODO: create use-case
  // buy(quantity: number, value: number, date?: Date) {
  //   if (!date) {
  //     date = new Date();
  //   }
  //   if (quantity < 0) {
  //     quantity = -quantity;
  //   }
  //   if (value > 0) {
  //     value = -value;
  //   }
  //   new Operation(date, quantity, value, this);
  // }

  // TODO: create use-case
  // sell(quantity: number, value: number, date?: Date) {
  //   if (!date) {
  //     date = new Date();
  //   }
  //   if (quantity > 0) {
  //     quantity = -quantity;
  //   }
  //   if (value < 0) {
  //     value = -value;
  //   }
  //   new Operation(date, quantity, value, this);
  // }

  getOperations(): Persisted<Operation>[] {
    for (let index = this.operations.length - 1; index >= 0; index--) {
      const { id } = this.operations[index];
      if (id !== undefined) {
        const persisted = this.operations.splice(index, 1)[0];
        this.persistedOperations.push(Object.assign(persisted, { id }));
      }
    }
    if (this.operations.length > 0) {
      console.warn('Position has some non-persisted operations');
    }
    return [...this.persistedOperations];
  }
}
