import { datatype, internet, name } from 'faker';

import { userTranslator, UserView } from '@gateway/presentation/view/user';

describe('User view', () => {
  it('should be able to extract only userName and role from the entity', () => {
    const expected: UserView = {
      id: datatype.hexaDecimal(24),
      userName: name.findName(),
      role: 'ADMIN',
    };
    const entity = {
      password: internet.password(),
      function: 'dev',
      ...expected,
    };
    expect(
      userTranslator.entityToView(entity)
    ).toEqual(expected);
  });

  it('should be able to extract only userName and role from a lot of entities', () => {
    const expected: UserView = {
      id: datatype.hexaDecimal(24),
      userName: name.findName(),
      role: 'ADMIN',
    };
    const withPass = {
      password: internet.password(),
      ...expected,
    };
    const withFunc = {
      function: 'dev',
      ...expected,
    };
    const withAll = {
      function: 'dev',
      ...withPass,
    };
    expect(
      userTranslator.entitiesToViews([ expected, withAll, withFunc, withPass ])
    ).toEqual([ expected, expected, expected, expected ]);
  });
});
