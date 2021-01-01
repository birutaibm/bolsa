import { adaptResolver } from '@main/adapters';
import { ControllerFactory } from '@presentation/factories';

export default (controllerFactory: ControllerFactory<any>) => ({
  Query: {
    async lastRanking(): Promise<any> {
      return adaptResolver(controllerFactory.make());
    }
  }
});
