export type UserView = {
  userName: string;
  role: 'ADMIN' | 'USER';
};

export const userTranslator = {
  entityToView<T extends UserView>(entity: T): UserView {
    return {
      userName: entity.userName,
      role: entity.role
    };
  },

  entitiesToViews<T extends UserView>(entities: T[]): UserView[] {
    return entities.map(userTranslator.entityToView);
  }
};
