import { ControllerFactory } from "@presentation/factories";
import { Router, Express, json } from "express";

type setupExpressRoute = (
  router: Router,
  controllerFactory: ControllerFactory<any>
) => void;

export default class ExpressRouterSetup {
  private readonly router: Router;

  constructor(app: Express) {
    this.router = Router();
    app.use(json());
    app.use('/api', this.router);
  }

  use(setup: setupExpressRoute, factory: ControllerFactory<any>) {
    setup(this.router, factory);
  }
}
