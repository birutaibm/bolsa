import mongoose from 'mongoose';

import { env } from '@infra/environment';
import { OperationDTO, Operations } from '@infra/data-source/model';
import { Mongo } from '@infra/data-source/database';
import { MongoOperationRepository } from '@infra/data-source/database/mongo/repositories/operation';

let mongo: Mongo;
let repo: MongoOperationRepository;
let id: mongoose.Types.ObjectId;
let dto: OperationDTO;
let operations: any[];

describe('Mongo operation repository', () => {
  beforeAll(async done => {
    async function createRepo(): Promise<MongoOperationRepository> {
      try {
        mongo = new Mongo(env.mongodb);
        return (await mongo.createRepositoryFactories()).operations.make();
      } catch (error) {
        throw error;
      }
    }
    operations = [];
    id = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
    dto = {
      date: new Date(),
      quantity: 100,
      value: -2345,
    };
    createRepo().then(
      result => {
        repo = result
        done();
      },
      done
    );
  });

  afterEach(async done => {
    try {
      await Operations.deleteMany({ _id: { $in: operations }});
      operations = [];
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(async done => {
    mongo.disconnect().then(() => done(), done);
  });

  it('should be able to load existent operation', async done => {
    const { id } = await Operations.create({...dto, date: dto.date.getTime()});
    operations.push(id);
    await expect(
      repo.loadOperationDataById(id)
    ).resolves.toEqual(expect.objectContaining(dto));
    done();
  });

  it('should not be able to load inexistent operation', async done => {
    await expect(
      repo.loadOperationDataById(id.toHexString())
    ).rejects.toEqual(
      expect.objectContaining({message: 'Unexpected null value'})
    );
    done();
  });

  it('should be able to save operation', async done => {
    const operation = await repo.saveNewOperation({
      ...dto,
      positionId: id.toHexString(),
      date: dto.date.getTime(),
    });
    const createdId = operation.id;
    operations.push(createdId);
    await expect(
      Operations.findById(createdId)
    ).resolves.toEqual(
      expect.objectContaining({position: id})
    );
    done();
  });
});
