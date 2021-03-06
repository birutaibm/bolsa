import mongoose from 'mongoose';

import { notNull } from '@utils/validators';

import { PositionDTO } from '@gateway/data/dto';

import { env } from '@infra/environment';
import { Positions, Operations, OperationDTO } from '@infra/data-source/model';
import { Mongo } from '@infra/data-source/database';
import { PositionRepository } from '@infra/data-source/database/mongo/repositories/position';

let mongo: Mongo;
let repo: PositionRepository;
let id: mongoose.Types.ObjectId;
let operation: OperationDTO;
let dto: PositionDTO;
let operations: any[];
let positions: any[];

describe('Mongo position repository', () => {
  beforeAll(async done => {
    async function createRepo(): Promise<PositionRepository> {
      try {
        mongo = new Mongo(env.mongodb);
        return (await mongo.createRepositoryFactories()).positions.make();
      } catch (error) {
        throw error;
      }
    }
    id = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
    operation = {
      date: new Date(),
      quantity: 100,
      value: -2345,
    };
    dto = {
      asset: {
        ticker: 'ITUB3',
        name: 'Itaú Unibanco SA',
      },
      operations: [],
    };
    operations = [];
    positions = [];
    createRepo().then(
      result => {
        repo = result
        done();
      },
      done
    );
  });

  afterEach(async done => {
    function clearTrash(err?: any) {
      operations = [];
      positions = [];
      done(err);
    }
    Promise.all([
      Operations.deleteMany({ _id: { $in: operations }}),
      Positions.deleteMany({ _id: { $in: positions }}),
    ]).then(() => clearTrash(), err => clearTrash(err));
  });

  afterAll(async done => {
    mongo.disconnect().then(() => done(), done);
  });

  it('should be able to load existent position', async done => {
    const { id } = await Positions.create({...dto});
    positions.push(id);
    const loaded = await repo.load(id);
    expect(loaded.asset).toEqual(expect.objectContaining(dto.asset));
    expect(loaded.operations).toEqual(expect.arrayContaining(dto.operations));
    expect(loaded.id).toEqual(id);
    done();
  });

  it('should not be able to load inexistent position', async done => {
    await expect(
      repo.load(id)
    ).rejects.toEqual(
      expect.objectContaining({message: 'Unexpected null value'})
    );
    done();
  });

  it('should be able to categorize positions', () => {
    const positions = [
      dto, {...dto, id},
    ];
    const expected = {
      existents: [{...dto, id}],
      nonExistents: [dto],
    };
    expect(PositionRepository.categorize(positions)).toEqual(expected);
  });

  it('should be able to save position', async done => {
    const position = await repo.create(dto, id);
    const createdId = position.id;
    positions.push(createdId);
    await expect(
      Positions.findById(createdId)
    ).resolves.toEqual(
      expect.objectContaining({wallet: id})
    );
    done();
  });

  it('should be able to save position with operation', async done => {
    const position = await repo.create({...dto, operations: [operation]}, id);
    const createdId = position.id;
    positions.push(createdId);
    await expect(
      Positions.findById(createdId)
    ).resolves.toEqual(
      expect.objectContaining({wallet: id})
    );
    done();
  });

  it('should be able to change asset in position', async done => {
    const { id: posId } = await Positions.create({
      ...dto,
      wallet: id,
    });
    positions.push(posId);
    const asset = {
      ticker: 'BBAS3',
      name: 'Banco do Brasil',
    };
    await repo.update({
      ...dto,
      asset,
      id: posId,
    })
    const position = notNull(await Positions.findById(posId));
    expect(position.asset).toEqual(expect.objectContaining(asset));
    expect(position.operations).toEqual(expect.arrayContaining(dto.operations));
    expect(position.id).toEqual(posId);
    expect(position.wallet).toEqual(id);
    done();
  });

  it('should be able to add operation in position', async done => {
    const { id: posId } = await Positions.create({
      ...dto,
      wallet: id,
    });
    positions.push(posId);
    await repo.update({
      ...dto,
      operations: [operation],
      id: posId,
    })
    const position = notNull(await Positions.findById(posId));
    expect(position.asset).toEqual(expect.objectContaining(dto.asset));
    expect(position.id).toEqual(posId);
    expect(position.wallet).toEqual(id);
    expect(position.operations.length).toBe(1);
    const persistedOperation = notNull(
      await Operations.findById(position.operations[0])
    );
    operations.push(position.operations[0]);
    expect(persistedOperation).toEqual(expect.objectContaining(
      {quantity: operation.quantity, value: operation.value}
    ));
    done();
  });

  it('should be able to remove operation in position', async done => {
    //GIVEN: the position has one operation
    const opDoc = await Operations.create(operation);
    const { id: posId } = await Positions.create({
      ...dto,
      wallet: id,
      operations: [opDoc.id],
    });
    opDoc.position = posId;
    await opDoc.save();
    positions.push(posId);
    operations.push(opDoc.id);
    //WHEN: update position from there repo
    await repo.update({
      ...dto,
      operations: [],
      id: posId,
    });
    //THEN: position is the same without operation
    const position = notNull(await Positions.findById(posId));
    expect(position.asset).toEqual(expect.objectContaining(dto.asset));
    expect(position.id).toEqual(posId);
    expect(position.wallet).toEqual(id);
    expect(position.operations.length).toBe(0);
    done();
  });

  it('should be able to update operation in position', async done => {
    //GIVEN: the position has one operation
    const opDoc = await Operations.create(operation);
    const { id: posId } = await Positions.create({
      ...dto,
      wallet: id,
      operations: [opDoc.id],
    });
    opDoc.position = posId;
    await opDoc.save();
    const changedOperation = {
      ...operation, id: opDoc.id, position: posId, quantity: 200
    };
    positions.push(posId);
    operations.push(opDoc.id);
    //WHEN: update position from there repo
    await repo.update({
      ...dto,
      operations: [changedOperation],
      id: posId,
    });
    //THEN: position is the same with operation changed
    const position = notNull(await Positions.findById(posId));
    expect(position.asset).toEqual(expect.objectContaining(dto.asset));
    expect(position.id).toEqual(posId);
    expect(position.wallet).toEqual(id);
    expect(position.operations.length).toBe(1);
    const persistedOperation = notNull(
      await Operations.findById(position.operations[0])
    );
    expect(persistedOperation).toEqual(expect.objectContaining(
      {quantity: changedOperation.quantity, value: changedOperation.value}
    ));
    done();
  });
});
