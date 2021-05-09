import { DatabaseConnectionError } from '@errors/database-connection';
import { UserNotFoundError } from '@errors/not-found';
import { Persisted } from '@utils/types';

import { UserRepository } from '@gateway/data/contracts';
import { UserDTO } from '@gateway/data/dto';

import PostgreSQL from '..';

type UserModel = {
  created_on: Date;
  id: string;
  username: string;
  pass_hash: string;
  role: 'USER' | 'ADMIN';
};

export class PostgreUserRepository implements UserRepository {
  constructor(
    private readonly db: PostgreSQL
  ) {}

  async getUserFromUsername(username: string): Promise<Persisted<UserDTO>> {
    const [ model ] = await this.db.query<UserModel>({
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username],
    });
    if (!model) {
      throw new UserNotFoundError(username);
    }
    return this.modelToData(model);
  }

  async saveUser(user: UserDTO): Promise<Persisted<{}>> {
    const query = {
      text: `INSERT INTO users(username, pass_hash, role, created_on)
      VALUES ($1, $2, $3, $4) RETURNING id`,
      values: [user.userName, user.passHash, user.role, new Date()],
    };
    const [ { id } ] = await this.db.query<{id: string}>(query);
    return { id };
  }

  private modelToData(
    {id, username, pass_hash, role}: UserModel
  ): Persisted<UserDTO> {
    return {
      id, userName: username, passHash: pass_hash, role
    };
  }
}
