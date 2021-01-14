export class NoneExternalSymbolRepository extends Error {
  constructor() {
    super(`You have none external symbol repository available`);
    this.name = 'NoneExternalSymbolRepository';
  }
}
