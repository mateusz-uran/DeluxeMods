import { expect } from 'chai';
import app from '../../app';
import '../setup/global';
import request from 'supertest';
import bcrypt from 'bcrypt';
import User from '../../models/User';

describe('Auth controller integration test', () => {
  describe('loginUser', () => {
    const plainPassword = 'randompassword';
    const email = 'johndoe@gmail.com';

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await User.create({
        name: 'JohnDoe',
        email,
        password: hashedPassword,
        roles: [],
      });
    });

    it('should login user and return json with message, email and accessToken', async () => {
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
      const response = await request(app)
        .post('/logout')
        .expect(200);

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
