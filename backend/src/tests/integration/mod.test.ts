import '../setup/global';
import request from 'supertest';
import app from '../../app';
import { createFakeModsInsideDB } from '../helpers/mods.helper';
import { expect } from 'chai';

describe('Mod controller integration test', () => {
  describe('GET getModsByParameter', () => {
    const endpoint = '/mod/all';

    beforeEach(async () => {
      const totalMods = 13;
      const publishedCount = 10;

      await createFakeModsInsideDB(
        totalMods,
        () => Math.random() > 0.5,
        (i) => i < publishedCount,
        (i) => {if (i % 3 === 0) return ['small']; else return ['plow/subsoiler', 'seeder/planter']},
      );
    });

    it('should return last six mods', async () => {
      const res = await request(app).get(endpoint);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('mods');
      expect(res.body.mods).to.be.an('array');
      expect(res.body.mods).to.have.lengthOf.at.most(6);
    });

    it('should return last six mods by category small', async () => {
      const res = await request(app).get(endpoint).query({ category: 'small' });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('mods');
      expect(res.body.mods).to.be.an('array');
      expect(res.body.mods).to.have.lengthOf.at.most(6);
      expect(res.body.mods.every((m: any) => m.categories.includes('small'))).to
        .be.true;
    });
  });
});
