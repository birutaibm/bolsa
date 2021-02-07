import UserCreator from '@domain/user/usecases/user-creator';
import { Factory } from '@utils/factory';
import { UserCreatorController } from '@gateway/presentation/controllers';
import { ControllerFactory } from '.';

export class UserCreatorControllerFactory
  extends ControllerFactory<UserCreatorController> {

  constructor(
    useCaseFactory: Factory<UserCreator>,
  ) {
    super(() => new UserCreatorController(useCaseFactory.make()));
  }
}
