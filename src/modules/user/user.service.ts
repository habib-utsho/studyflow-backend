import { User } from './user.model';
import { IUser } from './user.interface';
import { ApiError } from '../../utils/ApiError';
import { UpdateProfileInput, ChangePasswordInput } from './user.validation';

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  dailyGoal: number;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

export const toSafeUser = (user: IUser): SafeUser => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  dailyGoal: user.dailyGoal,
  theme: user.theme,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const createUser = async (data: { name: string; email: string; password: string }): Promise<IUser> => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }
  return User.create(data);
};

export const findByEmailWithPassword = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email: email.toLowerCase() }).select('+password');
};

export const findById = async (id: string): Promise<IUser> => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

export const updateProfile = async (id: string, data: UpdateProfileInput): Promise<IUser> => {
  const user = await findById(id);
  if (data.name !== undefined) user.name = data.name;
  if (data.dailyGoal !== undefined) user.dailyGoal = data.dailyGoal;
  if (data.theme !== undefined) user.theme = data.theme;
  await user.save();
  return user;
};

export const changePassword = async (id: string, data: ChangePasswordInput): Promise<void> => {
  const user = await User.findById(id).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  const isMatch = await user.comparePassword(data.oldPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Old password is incorrect');
  }
  user.password = data.newPassword;
  await user.save();
};
