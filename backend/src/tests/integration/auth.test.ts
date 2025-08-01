import { expect } from 'chai';
import app from '../../app';
import '../setup/global';
import request from 'supertest';
import { createTestUserWithRole } from '../helpers/authUser.helper';

describe('Auth controller integration test', () => {
  describe('loginUser', () => {
    const plainPassword = 'randompassword';
    const email = 'johndoe@gmail.com';

    it('should login user and return json with message, email and accessToken', async () => {
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

      expect(response.body).to.have.property('accessToken');
      expect(response.body).to.have.property('email', email);
      expect(response.body).to.have.property(
        'message',
        'User logged in successfully!',
      );
    });
  });

  describe('logoutUser', () => {
    it('should clear auth cookies and return a success message', async () => {
      const response = await request(app).post('/logout').expect(200);

      expect(response.body).to.have.property('message', 'User logged out!');

      const cookies = response.headers['set-cookie'];
      expect(cookies).to.satisfy((arr: string[]) =>
        arr.some(
          (cookie) =>
            cookie.includes('accessToken=') && cookie.includes('Expires=Thu'),
        ),
      );
    });
  });
});
