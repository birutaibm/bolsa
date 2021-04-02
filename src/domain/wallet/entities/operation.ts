import { Persisted } from '@utils/types';
import Position from './position';

export default class Operation {
  constructor(
    readonly id: string,
    readonly date: Date,
    readonly quantity: number,
    readonly value: number,
    readonly position: Persisted<Position>,
  ) {
    position.addOperation(this);
  }
};
