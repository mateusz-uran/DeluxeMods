import { clearDB, closeDB, connectInMemoryDB } from './db';

before(async () => {
  await connectInMemoryDB();
});

beforeEach(async () => {
  await clearDB();
});

after(async () => {
  await closeDB();
});
