import { afterAll, beforeAll, beforeEach } from 'vitest';

import { clearDB, closeDB, connectInMemoryDB } from './db';

beforeAll(async () => {
  await connectInMemoryDB();
});

beforeEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});
