import Position from './position';

export default class Operation {
  constructor(
    readonly date: Date,
    readonly quantity: number,
    readonly value: number,
    readonly position: Position,
  ) {
    position.addOperation(this);
  }
};
