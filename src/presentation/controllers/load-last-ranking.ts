import { LastRankingLoader } from '@domain/usecases';
import {
  Controller, Params, Response, ok, serverError
} from '@presentation/contracts';
import {
  RankingEntity, RankingView, rankingTranslator
} from '@presentation/view';

export class LoadLastRankingController implements Controller {
  constructor(
    private readonly lastRankingLoader: LastRankingLoader
  ) {}

  async handle(_: Params): Promise<Response<RankingView[]>> {
    try {
      const ranking: RankingEntity[] = await this.lastRankingLoader.load();
      const data = rankingTranslator.entitiesToViews(ranking);
      return ok(data);
    } catch (error) {
      console.log(error);
      return serverError(error);
    }
  }
}
