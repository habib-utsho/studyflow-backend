import { Document, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  subject?: Types.ObjectId | null;
  goal?: Types.ObjectId | null;
  priority: Priority;
  dueDate?: Date | null;
  minutes: number;
  completed: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
