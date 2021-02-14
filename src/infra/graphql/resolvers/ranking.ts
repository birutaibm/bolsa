import { Factory } from '@utils/factory';
import { LoadLastRankingController } from '@gateway/presentation/controllers';
import { adaptResolver } from '@infra/adapters';

export default (controllerFactory: Factory<LoadLastRankingController>) => ({
  Query: {
    async lastRanking(): Promise<any> {
      return adaptResolver(controllerFactory.make());
    }
  }
});
