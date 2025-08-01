import Role from '../../models/Role';
import { clearDB, closeDB, connectInMemoryDB } from './db';

before(async () => {
  await connectInMemoryDB();
});

beforeEach(async () => {
  await clearDB();

  await Role.create({ name: 'REVIEWER', permissions: [] });
  await Role.create({ name: 'ADMIN', permissions: ['ADD_USER'] });
});

after(async () => {
  await closeDB();
});
