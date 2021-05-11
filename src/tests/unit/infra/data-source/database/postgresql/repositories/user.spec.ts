import { AssetNotFoundError, UserNotFoundError } from '@errors/not-found';
import { SingletonFactory } from '@utils/factory';

import { env } from '@infra/environment';
import { PostgreSQL } from '@infra/data-source/database';
import { PostgreUserRepository } from '@infra/data-source/database/postgresql/repositories/user';

let db: PostgreSQL;
let repo: PostgreUserRepository;
let userName: string;
let users: string[];

describe('PostgreSQL user repository', () => {
  beforeAll(() => {
    users = [];
    userName = 'Rafael Arantes';
    db = new PostgreSQL(env.postgre);
    repo = db.createRepositoryFactories().users.make();
  });

  afterEach(async done => {
    try {
      if (users.length > 0) {
        const params = users.map((_, i) => `$${i+1}`).join(',');
        const query = {
          text: `DELETE FROM users WHERE id IN (${params})`,
          values: users,
        };
        await db.query(query);
        users = [];
      }
    } catch (error) {
      done(error);
    }
    done();
  });

  afterAll(async done => {
    try {
      if (users.length > 0) {
        const params = users.map((_, i) => `$${i+1}`).join(',');
        const query = {
          text: `DELETE FROM users WHERE id IN (${params})`,
          values: users,
        };
        await db.query(query);
        users = [];
      }
      db.disconnect();
    } catch (error) {
      done(error);
    }
    done();
  });

  it('should be able to get user from username', async done => {
    const [ { id } ] = await db.query<{id: string}>({
      text: `INSERT INTO users(username, pass_hash, role, created_on)
      VALUES ($1, $2, $3, $4) RETURNING id`,
      values: [userName, '123456', 'USER', new Date()],
    });
    users.push(id);
    await expect(
      repo.getUserFromUsername(userName)
    ).resolves.toEqual(expect.objectContaining({userName}));
    done();
  });

  it('should be able to create user', async done => {
    const { id: createdId } = await repo.saveUser({
      userName,
      passHash: '654321',
      role: 'USER'
    });
    users.push(createdId);
    await expect(
      db.query({
        text: 'SELECT * FROM users WHERE id = $1', values: [createdId],
      })
    ).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({
        username: userName,
        pass_hash: '654321',
        role: 'USER'
      })
    ]));
    done();
  });

  it('should not be able to get inexistent user from username', async done => {
    await expect(
      repo.getUserFromUsername('inexistent-username')
    ).rejects.toBeInstanceOf(UserNotFoundError);
    done();
  });
});
