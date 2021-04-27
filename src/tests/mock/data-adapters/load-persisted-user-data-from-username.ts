import { UserNotFoundError } from '@errors/not-found';

import {
  LoadPersistedUserDataFromUsername, PersistedUserData
} from '@domain/user/usecases';

export default {
  withUsers(...users: PersistedUserData[]): LoadPersistedUserDataFromUsername {
    return (userName: string) => {
      const user = users.find(user => user.userName === userName);
      if (!user) {
        throw new UserNotFoundError(userName);
      }
      return user;
    };
  }
};
