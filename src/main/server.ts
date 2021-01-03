import app from '@main/config/app';
import { env } from '@infra/environment';

app.listen(
  env.port,
  () => console.log(`Server running at http://localhost:${env.port}`)
);

export default app;
