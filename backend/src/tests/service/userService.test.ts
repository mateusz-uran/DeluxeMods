import bcrypt from 'bcrypt';
import sinon from 'sinon';
import { expect } from 'chai';
import { login, register, validateUserById } from '../../service/user.service';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors/CustomError';
import User from '../../models/User';
import Role from '../../models/Role';
import { Types } from 'mongoose';

describe('User service unit tests', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => sandbox.restore());

  describe('register', () => {
    it('should throw if required fields are missing', async () => {
      try {
        await register('', '', '');
      } catch (err: any) {
        expect(err).to.be.instanceOf(BadRequestError);
        expect(err.message).to.equal('All fields must be filled.');
      }
    });

    it('should throw for invalid email', async () => {
      try {
        await register('Test', 'invalidemail', 'StrongPass123!');
      } catch (err: any) {
        expect(err).to.be.instanceOf(BadRequestError);
        expect(err.message).to.equal('Given email is not valid.');
      }
    });

    it('should throw for weak password', async () => {
      try {
        await register('Test', 'test@email.com', '123');
      } catch (err: any) {
        expect(err).to.be.instanceOf(BadRequestError);
        expect(err.message).to.equal('Given password is not strong enough.');
      }
    });

    it('should throw if user already exists', async () => {
      sandbox.stub(User, 'findOne').returns({
        exec: sandbox.stub().resolves({ _id: new Types.ObjectId() }), // symulujemy, że user jest
      } as any);

      try {
        await register('John', 'john@example.com', 'StrongPass123!');
        throw new Error('Expected error not thrown');
      } catch (err: any) {
        expect(err).to.be.instanceOf(BadRequestError);
        expect(err.message).to.equal('User alredy exists.');
      }
    });

    it('should throw if role not found', async () => {
      sandbox.stub(User, 'findOne').returns({
        exec: () => Promise.resolve(null),
      } as any);

      sandbox.stub(Role, 'findOne').returns({
        exec: () => Promise.resolve(null),
      } as any);

      sandbox.stub(bcrypt, 'genSalt').resolves('salt');
      sandbox.stub(bcrypt, 'hash').resolves('hashedPassword');

      try {
        await register('John', 'john@example.com', 'StrongPass123!');
        throw new Error('Expected error not thrown');
      } catch (err: any) {
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.equal('Role not found.');
      }
    });

    it('should register a new user successfully', async () => {
      sandbox.stub(User, 'findOne').returns({
        exec: sandbox.stub().resolves(null),
      } as any);

      sandbox.stub(Role, 'findOne').returns({
        exec: sandbox
          .stub()
          .resolves({ _id: new Types.ObjectId(), name: 'REVIEWER' }),
      } as any);

      sandbox.stub(bcrypt, 'genSalt').resolves('salt');
      sandbox.stub(bcrypt, 'hash').resolves('hashedPassword');

      const createStub = sandbox.stub(User, 'create').resolves({
        name: 'John',
        email: 'john@example.com',
      } as any);

      const result = await register('Test', 'test@email.com', 'StrongPass123!');

      expect(createStub.calledOnce).to.be.true;
      expect(result).to.have.property(
        'message',
        'User registered with default role.',
      );
      expect(result.user).to.deep.equal({
        name: 'John',
        email: 'john@example.com',
      });
    });
  });

  describe('login', () => {
    it('should throw if email or password is missing', async () => {
      try {
        await login('', '', false, {});
      } catch (err: any) {
        expect(err).to.be.instanceOf(BadRequestError);
      }
    });

    it('should throw if user not found', async () => {
      sandbox.stub(User, 'findOne').returns({
        select: () => ({
          populate: () => ({ exec: () => null }),
        }),
      } as any);

      try {
        await login('test@email.com', 'password', false, {});
      } catch (err: any) {
        expect(err).to.be.instanceOf(UnauthorizedError);
      }
    });

    it('should throw if password is incorrect', async () => {
      const fakeUser = { password: 'hashed' };

      sandbox.stub(User, 'findOne').returns({
        select: () => ({
          populate: () => ({ exec: () => fakeUser }),
        }),
      } as any);

      sandbox.stub(bcrypt, 'compare').resolves(false);

      try {
        await login('test@email.com', 'wrongpass', false, {});
      } catch (err: any) {
        expect(err).to.be.instanceOf(UnauthorizedError);
      }
    });

    it('should return tokens and email if login is successful', async () => {
      const fakeUser = {
        email: 'test@email.com',
        password: 'hashed',
        _id: new Types.ObjectId(),
        roles: [],
      };

      sandbox.stub(User, 'findOne').returns({
        select: () => ({
          populate: () => ({ exec: () => fakeUser }),
        }),
      } as any);

      sandbox.stub(bcrypt, 'compare').resolves(true);

      const mockAccessTokenCreator = sandbox.stub().returns('mockAccessToken');
      const mockRefreshTokenCreator = sandbox
        .stub()
        .returns('mockRefreshToken');

      const result = await login('test@email.com', 'correctpass', false, {
        accessTokenCreator: mockAccessTokenCreator,
        refreshTokenCreator: mockRefreshTokenCreator,
      });

      expect(result).to.deep.equal({
        email: fakeUser.email,
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      sinon.assert.calledWith(mockAccessTokenCreator, fakeUser);
      sinon.assert.calledWith(mockRefreshTokenCreator, fakeUser, false);
    });
  });

  describe('validateUserById', () => {
    it('should return user if found', async () => {
      const fakeUser = { _id: new Types.ObjectId() };
      sandbox.stub(User, 'findById').resolves(fakeUser as any);

      const result = await validateUserById(fakeUser._id);

      expect(result).to.deep.equal(fakeUser);
    });

    it('should throw if user not found', async () => {
      sandbox.stub(User, 'findById').resolves(null);

      try {
        await validateUserById(new Types.ObjectId());
      } catch (err: any) {
        expect(err).to.be.instanceOf(UnauthorizedError);
      }
    });
  });
});
