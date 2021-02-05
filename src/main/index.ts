import app from '@infra/server';
import { env } from '@infra/environment';

app.listen(
  env.port,
  () => console.log(`Server running at http://localhost:${env.port}`)
);

export default app;
