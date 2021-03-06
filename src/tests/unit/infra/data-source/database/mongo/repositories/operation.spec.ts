import mongoose from 'mongoose';
import { env } from '@infra/environment';
import { OperationDTO, Operations } from '@infra/data-source/model';
import { Mongo } from '@infra/data-source/database';
import { OperationRepository } from '@infra/data-source/database/mongo/repositories/operation';

let mongo: Mongo;
let repo: OperationRepository;
let id: mongoose.Types.ObjectId;
let dto: OperationDTO;
let operations: any[];

describe('Mongo operation repository', () => {
  beforeAll(async done => {
    async function createRepo(): Promise<OperationRepository> {
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
      repo.load(id)
    ).resolves.toEqual(expect.objectContaining(dto));
    done();
  });

  it('should not be able to load inexistent operation', async done => {
    await expect(
      repo.load(id)
    ).rejects.toEqual(
      expect.objectContaining({message: 'Unexpected null value'})
    );
    done();
  });

  it('should be able to save operation', async done => {
    const operation = await repo.create(dto, id);
    const createdId = operation.id;
    operations.push(createdId);
    await expect(
      Operations.findById(createdId)
    ).resolves.toEqual(
      expect.objectContaining({position: id})
    );
    done();
  });

  it('should be able to categorize operations', () => {
    const operations = [
      dto, {...dto, id},
    ];
    const expected = {
      existents: [{...dto, id}],
      nonExistents: [dto],
    };
    expect(OperationRepository.categorize(operations)).toEqual(expected);
  });

  it('should be able to update date in operation', async done => {
    const { id: opId } = await Operations.create({
      ...dto,
      date: dto.date.getTime(),
      position: id,
    });
    operations.push(opId);
    const date = new Date(2021, 2, 3);
    await repo.update({
      ...dto,
      date,
      id: opId,
    })
    await expect(
      Operations.findById(opId)
    ).resolves.toEqual(expect.objectContaining({
      value: dto.value,
      date: date.getTime(),
    }));
    done();
  });

  it('should be able to update quantity in operation', async done => {
    const { id: opId } = await Operations.create({
      ...dto,
      date: dto.date.getTime(),
      position: id,
    });
    operations.push(opId);
    await repo.update({
      ...dto,
      quantity: 200,
      id: opId,
    })
    await expect(
      Operations.findById(opId)
    ).resolves.toEqual(expect.objectContaining({
      value: dto.value,
      quantity: 200,
    }));
    done();
  });

  it('should be able to update value in operation', async done => {
    const { id: opId } = await Operations.create({
      ...dto,
      date: dto.date.getTime(),
      position: id,
    });
    operations.push(opId);
    await repo.update({
      ...dto,
      value: 200,
      id: opId,
    })
    await expect(
      Operations.findById(opId)
    ).resolves.toEqual(expect.objectContaining({
      value: 200,
      quantity: dto.quantity,
    }));
    done();
  });
});
