import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../../app';
import { createTestRole } from '../helpers/role.helper';
import {
  createTestUserWithRole,
  CreateUserOutput,
} from '../helpers/user.helper';

import { beforeEach, describe, expect, it } from 'vitest';

describe('User controller integration test', () => {
  describe('registerUser', () => {
    const endpoint = '/user/register-user';
    let admin: CreateUserOutput;

    beforeEach(async () => {
      await createTestRole([
        { name: 'ADMIN', permissions: ['ADD_USER'] },
        { name: 'REVIEWER' },
      ]);

      [admin] = await createTestUserWithRole({ roleName: 'ADMIN' });
    });

    it('should allow admin with ADD_USER permission to register a user', async () => {
      const name = faker.internet.username();
      const email = faker.internet.email();

      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies.join('; '))
        .send({
          name,
          email,
          password: 'StrongPassword_123%^&',
        });

      expect(res.body).toHaveProperty(
        'message',
        'User registered with default role.',
      );

      expect(res.body).toEqual(
        expect.objectContaining({
          user: { email, name },
        }),
      );
    });

    it('should reject if missing required fields', async () => {
      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies)
        .send({
          email: 'missingname@example.com',
        });

      expect(res.status).toEqual(400);
      expect(res.body.errors[0].message).toEqual(
        'Invalid input: expected string, received undefined',
      );
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies)
        .send({
          name: 'WeakPass',
          email: 'weak@example.com',
          password: '123',
        });

      expect(res.status).toEqual(400);
      expect(res.body.errors[0].message).toEqual(
        'Given password is not strong enough.',
      );
    });

    it('should reject duplicate email', async () => {
      const payload = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'StrongPassword_123%^&',
      };

      await createTestUserWithRole([{ email: payload.email }]);

      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies)
        .send(payload);

      expect(res.status).toEqual(400);
      expect(res.body.errors[0].message).toEqual('User alredy exists.');
    });

    it('should reject if user lacks ADD_USER permission', async () => {
      const [fakeAdmin] = await createTestUserWithRole([
        { email: 'fakeAdmin@gmail.com', roleName: 'REVIEWER' },
      ]);

      const res = await request(app)
        .post(endpoint)
        .set('Cookie', fakeAdmin.cookies)
        .send({
          name: 'Hacker',
          email: 'hacker@example.com',
          password: 'StrongPassword_123%^&',
        });

      expect(res.status).toEqual(403);
      expect(res.body.errors[0].message).toEqual('Forbidden: no permission');
    });
  });

  describe('updateUserRole', () => {
    const endpoint = '/user/update-role';
    const email = faker.internet.email();
    const newRole = 'EDITOR';
    const oldRole = 'REVIEWER';

    let admin: CreateUserOutput;
    let reviewer: CreateUserOutput;

    beforeEach(async () => {
      await createTestRole([
        { name: 'ADMIN', permissions: ['ADD_USER', 'UPDATE_USER'] },
        { name: 'REVIEWER' },
        { name: 'EDITOR' },
      ]);

      [admin, reviewer] = await createTestUserWithRole([
        { email: 'johnDoeAdmin@gmail.com', roleName: 'ADMIN' },
        { email, roleName: 'REVIEWER' },
      ]);
    });

    it('should update user with new role EDITOR', async () => {
      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies)
        .send({
          email,
          newRole,
        });

      expect(res.body).toHaveProperty('message', 'User roles updated');

      expect(res.body.user.roles).toContain('EDITOR');
    });

    it('should update user by removing old role', async () => {
      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies)
        .send({
          email,
          oldRole,
        });
      expect(res.body).toHaveProperty('message', 'User roles updated');

      expect(res.body.user.roles).lengthOf(0);
    });

    it('should update user by removing old role and adding new one', async () => {
      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies)
        .send({
          email,
          newRole,
          oldRole,
        });

      expect(res.body).toHaveProperty('message', 'User roles updated');

      expect(res.body.user.roles).not.toContain('REVIEWER');
      expect(res.body.user.roles).toContain('EDITOR');
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies)
        .send({
          newRole,
        });

      expect(res.status).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: 'error',
          message: 'Validation failed',
        }),
      );
      expect(res.body.errors[0]).toEqual(
        expect.objectContaining({
          path: 'body.email',
          message: 'Invalid email address',
        }),
      );
    });

    it('should return 404 when user is not found', async () => {
      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies)
        .send({
          email: 'nonexistent@example.com',
          newRole,
        });

      expect(res.status).toEqual(404);
      expect(res.body.errors).toEqual(expect.any(Array));
      expect(res.body.errors[0]).toHaveProperty('message', 'User not found.');
    });

    it('should return 400 when email format is invalid', async () => {
      const res = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies)
        .send({
          email: 'invalid-email',
          newRole,
        });

      expect(res.status).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: 'error',
          message: 'Validation failed',
        }),
      );
      expect(res.body.errors[0]).toEqual(
        expect.objectContaining({
          path: 'body.email',
          message: 'Invalid email address',
        }),
      );
    });
  });
});
