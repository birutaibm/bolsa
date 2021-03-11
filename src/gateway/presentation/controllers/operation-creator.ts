import { isValidISODate } from '@utils/validators';

import { Authorization } from '@domain/user/usecases';
import { OperationCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class OperationCreatorController implements Controller {
  constructor(
    private readonly operationCreator: OperationCreator,
    private readonly auth: Authorization,
  ) {}

  async handle({date, quantity, value, positionId, authorization}: Params): Promise<Response> {
    const loggedUserId = this.auth.getInfo(authorization)?.id;
    if (!loggedUserId) {
      return unauthorized('Login required to this action!');
    }
    if (!date || !quantity || !value || !positionId) {
      return clientError('Required parameters: date, quantity, value, positionId');
    }
    if (!isValidISODate(date)) {
      return clientError('Date must be in ISO format');
    }
    const quantityNumber = Number(quantity);
    const valueNumber = Number(value);
    if (isNaN(quantityNumber) || isNaN(valueNumber) || quantityNumber * valueNumber < 0) {
      return clientError('Quantity and value must be opposite signal numbers');
    }
    try {
      const operation = await this.operationCreator.create(
        new Date(date), Number(quantity), Number(value), positionId, loggedUserId
      );
      return created(operation);
    } catch (error) {
      return serverError(error);
    }
  }
}
