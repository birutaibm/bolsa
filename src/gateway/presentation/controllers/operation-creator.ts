import { SignInRequiredError } from '@errors/sign-in-required';
import { isValidISODate } from '@utils/validators';

import { Authorization } from '@domain/user/usecases';
import { OperationCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { operationView } from '../view/operation';
import { InvalidParameterValueError } from '@errors/invalid-parameter-value';

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
    if (isNaN(quantityNumber) || isNaN(valueNumber)) {
      return clientError('Quantity and value must be cast to valid numbers');
    }
    try {
      const operation = await this.operationCreator.create(
        new Date(date), Number(quantity), Number(value), positionId, loggedUserId
      );
      return created(operationView(operation));
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      if (error instanceof InvalidParameterValueError) {
        return clientError(error.message);
      }
      return serverError(error);
    }
  }
}
