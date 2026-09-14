import { Document, Types } from 'mongoose';

export type Theme = 'light' | 'dark';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  dailyGoal: number;
  theme: Theme;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}
