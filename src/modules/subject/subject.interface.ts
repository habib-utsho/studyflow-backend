import { Document, Types } from 'mongoose';

export interface ISubject extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
