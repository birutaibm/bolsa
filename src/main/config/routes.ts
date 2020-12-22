import { Express, Router } from 'express';
import { readdirSync } from 'fs';
import { resolve } from 'path';

export function setupRoutes(app: Express): void {
  const router = Router();
  app.use('/api', router);
  readdirSync(resolve(__dirname, '..', 'routes')).map(async fileName => {
    const filePath = resolve(__dirname, '..', 'routes', fileName);
    (await import(filePath)).default(router);
  });
}