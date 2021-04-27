import { finance, date as fakeDate, lorem } from 'faker';

export function fakePrice(doNotFake?: {date?: Date}) {
  const min = Number(finance.amount());
  const max = Number(finance.amount(min));
  const open = Number(finance.amount(min, max));
  const close = Number(finance.amount(min, max));
  const date = doNotFake?.date || fakeDate.past();
  return { date, min, max, open, close, };
}

export function fakeTicker() {
  return lorem.word(5);
}
