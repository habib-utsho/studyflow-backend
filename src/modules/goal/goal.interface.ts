import { Document, Types } from 'mongoose';

export interface IGoal extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  subject?: Types.ObjectId | null;
  target: number;
  deadline?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
