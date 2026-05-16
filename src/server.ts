import { createApp } from './app';
import { loadEnv } from './config/env';

const env = loadEnv();
const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`); // eslint-disable-line no-console
});
