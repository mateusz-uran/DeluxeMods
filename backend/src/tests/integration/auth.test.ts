import app from '../../app';
import request from 'supertest';
import { createTestUserWithRole } from '../helpers/user.helper';
import { createTestRole } from '../helpers/role.helper';

import { describe, expect, it } from 'vitest';

describe('Auth controller integration test', () => {
  describe('loginUser', () => {
    const plainPassword = 'randompassword';
    const email = 'johndoe@gmail.com';

    it('should login user and return json with message, email and accessToken', async () => {
      await createTestRole({ name: 'REVIEWER' });

      await createTestUserWithRole({
        email: email,
        password: plainPassword,
      });

      const loginInput = {
        email,
        password: plainPassword,
        rememberMe: true,
      };

      const response = await request(app)
        .post('/login')
        .send(loginInput)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('email', email);
      expect(response.body).toHaveProperty(
        'message',
        'User logged in successfully!',
      );
    });
  });

  describe('logoutUser', () => {
    it('should clear auth cookies and return a success message', async () => {
      const response = await request(app).post('/logout').expect(200);

      expect(response.body).toHaveProperty('message', 'User logged out!');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);

      const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];

      cookiesArray.forEach((cookie) => {
        expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
      });
    });
  });
});
