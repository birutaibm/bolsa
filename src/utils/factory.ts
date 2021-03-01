type FactoryFunction<T> = () => T;

export class Factory<T> {
  constructor(
    public readonly make: FactoryFunction<T>
  ) {}
}

export class SingletonFactory<T> extends Factory<T> {
  private instance: T;

  constructor(
    factory: FactoryFunction<T>
  ) {
    super(() => {
      if (!this.instance) {
        this.instance = factory();
      }
      return this.instance;
    });
  }
}

export abstract class Builder<T> {
  abstract build(): T;

  asSingletonFactory() {
    return new SingletonFactory(() => this.build());
  }
}
