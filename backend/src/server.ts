import app from './app';
import { connectDB } from './config/db';
import config from './config/env';

app.listen(config.port, () => {
  connectDB().catch((err: unknown) => {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
  });
  console.log('Server is running on port:', config.port);
});
