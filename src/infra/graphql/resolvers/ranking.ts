import { adaptResolver } from '@infra/adapters';
import { LoadLastRankingControllerFactory } from '@gateway/presentation/factories';

export default (controllerFactory: LoadLastRankingControllerFactory) => ({
  Query: {
    async lastRanking(): Promise<any> {
      return adaptResolver(controllerFactory.make());
    }
  }
});
