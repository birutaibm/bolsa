import { Factory, SingletonFactory } from '@utils/factory';

let factoryFn: () => object;

describe('Factory', () => {
  beforeAll(() => {
    factoryFn = () => ({
      object: 'test',
    });
  });

  it('should be able to create there object', () => {
    const factory = new Factory(factoryFn);
    const make = jest.spyOn(factory, 'make');
    const made = factory.make();
    expect(make).toBeCalledTimes(1);
    expect(typeof made).toBe('object');
    expect(Object.keys(made).length).toBe(1);
    expect(made['object']).toBe('test');
  });

  it('should be able to create multiple instances of there object', () => {
    const factory = new Factory(factoryFn);
    const make = jest.spyOn(factory, 'make');
    const obj1 = factory.make();
    const obj2 = factory.make();
    expect(make).toBeCalledTimes(2);
    expect(obj1).toEqual(obj2);
    expect(obj1).not.toBe(obj2);
  });

  it('of type Singleton should create always the same instance of there object', () => {
    const factory = new SingletonFactory(factoryFn);
    const make = jest.spyOn(factory, 'make');
    const obj1 = factory.make();
    const obj2 = factory.make();
    expect(make).toBeCalledTimes(2);
    expect(obj1).toBe(obj2);
  });
});
