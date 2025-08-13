import bcrypt from 'bcrypt';
import { login, register, validateUserById } from '../../service/user.service';
import {
  BadRequestError,
  UnauthorizedError,
} from '../../utils/errors/CustomError';
import User from '../../models/User';
import Role from '../../models/Role';
import { Types } from 'mongoose';

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('User service unit tests', () => {
  afterEach(() => vi.restoreAllMocks());

  describe('register', () => {
    it('should throw if required fields are missing', async () => {
      await expect(register('', '', '')).rejects.toThrow(
        'All fields must be filled.',
      );
    });

    it('should throw for invalid email', async () => {
      await expect(
        register('Test', 'invalidemail', 'StrongPass123!'),
      ).rejects.toThrow('Given email is not valid.');
    });

    it('should throw for weak password', async () => {
      await expect(register('Test', 'test@email.com', '123')).rejects.toThrow(
        'Given password is not strong enough.',
      );
    });

    it('should throw if user already exists', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
      } as any);

      await expect(
        register('John', 'john@example.com', 'StrongPass123!'),
      ).rejects.toThrow('User alredy exists.');
    });

    it('should throw if role not found', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as any);

      vi.spyOn(Role, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as any);

      vi.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as any);
      vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as any);

      await expect(
        register('John', 'john@example.com', 'StrongPass123!'),
      ).rejects.toThrow('Role not found.');
    });

    it('should register a new user successfully', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as any);

      vi.spyOn(Role, 'findOne').mockReturnValue({
        exec: vi
          .fn()
          .mockResolvedValue({ _id: new Types.ObjectId(), name: 'REVIEWER' }),
      } as any);

      vi.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as any);
      vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as any);

      const createStub = vi.spyOn(User, 'create').mockResolvedValue({
        name: 'John',
        email: 'john@example.com',
      } as any);

      const result = await register('Test', 'test@email.com', 'StrongPass123!');

      expect(createStub).toBeCalledTimes(1);
      expect(result).toHaveProperty(
        'message',
        'User registered with default role.',
      );
      expect(result.user).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });
  });

  describe('login', () => {
    it('should throw if email or password is missing', async () => {
      await expect(login('', '', false, {})).rejects.toThrowError(
        BadRequestError,
      );
    });

    it('should throw if user not found', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: () => ({
          populate: () => ({ exec: () => null }),
        }),
      } as any);

      await expect(
        login('test@email.com', 'password', false, {}),
      ).rejects.toThrowError(UnauthorizedError);
    });

    it('should throw if password is incorrect', async () => {
      const fakeUser = { password: 'hashed' };

      vi.spyOn(User, 'findOne').mockReturnValue({
        select: () => ({
          populate: () => ({ exec: () => fakeUser }),
        }),
      } as any);

      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

      await expect(
        login('test@email.com', 'wrongpass', false, {}),
      ).rejects.toThrowError(UnauthorizedError);
    });

    it('should return tokens and email if login is successful', async () => {
      const fakeUser = {
        email: 'test@email.com',
        password: 'hashed',
        _id: new Types.ObjectId(),
        roles: [],
      };

      vi.spyOn(User, 'findOne').mockReturnValue({
        select: () => ({
          populate: () => ({ exec: () => fakeUser }),
        }),
      } as any);

      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      const mockAccessTokenCreator = vi.fn().mockReturnValue('mockAccessToken');
      const mockRefreshTokenCreator = vi
        .fn()
        .mockReturnValue('mockRefreshToken');

      const result = await login('test@email.com', 'correctpass', false, {
        accessTokenCreator: mockAccessTokenCreator,
        refreshTokenCreator: mockRefreshTokenCreator,
      });

      expect(result).toEqual({
        email: fakeUser.email,
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      expect(mockAccessTokenCreator).toHaveBeenCalledWith(fakeUser);
      expect(mockRefreshTokenCreator).toHaveBeenCalledWith(fakeUser, false);
    });
  });

  describe('validateUserById', () => {
    it('should return user if found', async () => {
      const fakeUser = { _id: new Types.ObjectId() };
      vi.spyOn(User, 'findById').mockResolvedValue(fakeUser as any);

      const result = await validateUserById(fakeUser._id);

      expect(result).toEqual(fakeUser);
    });

    it('should throw if user not found', async () => {
      vi.spyOn(User, 'findById').mockResolvedValue(null);
      await expect(validateUserById(new Types.ObjectId())).rejects.toThrowError(
        UnauthorizedError,
      );
    });
  });
});
