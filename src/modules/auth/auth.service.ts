import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { IUser } from '../user/user.interface';
import * as userService from '../user/user.service';
import { SafeUser } from '../user/user.service';
import { RegisterInput, LoginInput } from './auth.validation';

const signToken = (user: IUser): string => {
  return jwt.sign({ id: user._id.toString(), email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const register = async (data: RegisterInput): Promise<{ token: string; user: SafeUser }> => {
  const user = await userService.createUser(data);
  const token = signToken(user);
  return { token, user: userService.toSafeUser(user) };
};

export const login = async (data: LoginInput): Promise<{ token: string; user: SafeUser }> => {
  const user = await userService.findByEmailWithPassword(data.email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const token = signToken(user);
  return { token, user: userService.toSafeUser(user) };
};
