import { Types } from 'mongoose';

import { notNull } from '@utils/validators';

import { PositionDTO } from '@gateway/data/dto';

import Positions, { PositionDocument } from '@infra/data-source/model/position';
import { OperationDTO } from '@infra/data-source/model/operation';

import { OperationRepository } from './operation';

export class PositionRepository {
  constructor(
    private readonly operations: OperationRepository,
  ) {}

  static categorize(positions: PositionDTO[]) {
    const categorized: {
      existents: Array<PositionDTO & {id: Types.ObjectId;}>;
      nonExistents: PositionDTO[];
    } = { existents: [], nonExistents: [], };
    positions.forEach(position => {
      if (position.id) {
        categorized.existents.push({ ...position, id: position.id });
      } else {
        categorized.nonExistents.push(position);
      }
    });
    return categorized;
  }

  async load(id: Types.ObjectId): Promise<PositionDTO> {
    const model = notNull(await Positions.findById(id));
    const promises = model.operations.map(this.operations.load);
    return {
      id: model.id,
      asset: model.asset,
      operations: await Promise.all(promises),
    };
  }

  async create(
    position: PositionDTO, walletId: Types.ObjectId
  ): Promise<PositionDocument> {
    const registry = await Positions.create({
      wallet: walletId, asset: position.asset,
    });
    const operations = await Promise.all(
      position.operations.map(op => this.operations.create(op, registry.id))
    );
    registry.operations = operations.map(operation => operation._id);
    return await registry.save();
  }

  async update(dto: PositionDTO & {id: Types.ObjectId;}) {
    const registry = notNull(await Positions.findById(dto.id));
    if (registry.asset.name !== dto.asset.name) {
      registry.asset.name = dto.asset.name;
    }
    if (registry.asset.ticker !== dto.asset.ticker) {
      registry.asset.ticker = dto.asset.ticker;
    }
    const operations = OperationRepository.categorize(dto.operations);
    await this.updateOperations(registry, operations.existents);
    await this.addOperations(operations.nonExistents, registry);
    await registry.save();
  }

  private async updateOperations(
    position: PositionDocument,
    operations: Array<OperationDTO & {id: Types.ObjectId}>,
  ) {
    const indices = position.operations.map(id =>
      operations.findIndex(operation => String(operation.id) === String(id))
    );
    for (let i = position.operations.length - 1; i >= 0; i--) {
      const index = indices[i];
      if (index === -1) {
        position.operations.splice(i, 1);
      } else {
        await this.operations.update(operations[index]);
      }
    }
  }

  private async addOperations(
    operations: OperationDTO[],
    position: PositionDocument,
  ) {
    const promises = operations.map(async operation => {
      const saved = await this.operations.create(
        operation, position._id
      );
      return saved._id;
    });
    position.operations.push(...await Promise.all(promises));
  }
}
