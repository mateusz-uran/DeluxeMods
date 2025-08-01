import { createTestUserWithRole } from '../helpers/authUser.helper';
import '../setup/global';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../app';

describe('User controller integration test', () => {
  describe('registerUser', () => {
    const endpoint = '/user/register-user';

    it('should allow admin with ADD_USER permission to register a user', async () => {
      const name = 'JohnDoe';
      const email = 'john@example.com';

      const { cookies } = await createTestUserWithRole({
        roleName: 'admin',
        permissions: ['ADD_USER'],
      });

      const res = await request(app)
        .post(endpoint)
        .set('Cookie', cookies)
        .send({
          name,
          email,
          password: 'StrongPassword_123%^&',
        });
      expect(res.body).to.have.property(
        'message',
        'User registered with default role.',
      );

      expect(res.body).to.deep.include({
        user: { email, name },
      });
    });

    it('should reject if missing required fields', async () => {
      const { cookies } = await createTestUserWithRole({
        roleName: 'admin',
        permissions: ['ADD_USER'],
      });

      const res = await request(app)
        .post(endpoint)
        .set('Cookie', cookies)
        .send({
          email: 'missingname@example.com',
        });

      expect(res.status).to.equal(400);
      expect(res.body.errors[0].message).to.include(
        'Invalid input: expected string, received undefined',
      );
    });

    it('should reject weak password', async () => {
      const { cookies } = await createTestUserWithRole({
        roleName: 'admin',
        permissions: ['ADD_USER'],
      });

      const res = await request(app)
        .post(endpoint)
        .set('Cookie', cookies)
        .send({
          name: 'WeakPass',
          email: 'weak@example.com',
          password: '123',
        });

      expect(res.status).to.equal(400);
      expect(res.body.errors[0].message).to.include('password is not strong');
    });

    it('should reject duplicate email', async () => {
      const { cookies } = await createTestUserWithRole({
        roleName: 'admin',
        permissions: ['ADD_USER'],
      });

      const payload = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'StrongPassword_123%^&',
      };

      await request(app).post(endpoint).set('Cookie', cookies).send(payload);
      const res = await request(app)
        .post(endpoint)
        .set('Cookie', cookies)
        .send(payload);

      expect(res.status).to.equal(400);
      expect(res.body.errors[0].message).to.include('User alredy exists');
    });

    it('should reject if user lacks ADD_USER permission', async () => {
      const { cookies } = await createTestUserWithRole({
        roleName: 'viewer',
        permissions: [],
      });

      const res = await request(app)
        .post(endpoint)
        .set('Cookie', cookies)
        .send({
          name: 'Hacker',
          email: 'hacker@example.com',
          password: 'StrongPassword_123%^&',
        });

      expect(res.status).to.equal(403);
      expect(res.body.errors[0].message).to.include('Forbidden');
    });
  });
});
