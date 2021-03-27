import { SignInRequiredError } from '@errors/sign-in-required';
import { isNumber, isValidISODate } from '@utils/validators';

import { Authorization } from '@domain/user/usecases';
import { OperationCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { operationView } from '../view/operation';
import { InvalidParameterValueError } from '@errors/invalid-parameter-value';
import { OperationCreationBaseData, OperationCreationData } from '@domain/wallet/usecases/dtos';

export class OperationCreatorController implements Controller {
  constructor(
    private readonly operationCreator: OperationCreator,
    private readonly auth: Authorization,
  ) {}

  private validateBasicInfo(
    date?: string, quantity?: string, value?: string, authorization?: string
  ): OperationCreationBaseData {
    if (!date || !quantity || !value) {
      throw new InvalidParameterValueError(
        'Required parameters: date, quantity, value'
      );
    }
    if (!isValidISODate(date)) {
      throw new InvalidParameterValueError('Date must be in ISO format');
    }
    if (!isNumber(quantity) || !isNumber(value)) {
      throw new InvalidParameterValueError(
        'Quantity and value must be cast to valid numbers'
      );
    }
    return {
      isLogged: (id: string) => this.auth.checkId(id, authorization),
      date: new Date(date),
      quantity: Number(quantity),
      value: Number(value),
    };
  }

  async handle({
    date, quantity, value, authorization, positionId, assetId, walletId,
    walletName, investorId,
  }: Params): Promise<Response> {
    try {
      const data = this.validateBasicInfo(date, quantity, value, authorization);
      if (positionId) {
        const operation = await this.operationCreator.create({
          ...data, positionId,
        });
        return created(operationView(operation));
      } if (!assetId) {
        return clientError('Required parameters: positionId or assetId');
      }
      if (walletId) {
        const operation = await this.operationCreator.create({
          ...data, assetId, walletId,
        });
        return created(operationView(operation));
      }
      if (!walletName) {
        return clientError('Required parameters: walletId or walletName');
      }
      if (investorId) {
        const operation = await this.operationCreator.create({
          ...data, assetId, walletName, investorId,
        });
        return created(operationView(operation));
      }
      return clientError('Required parameters: investorId');
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
