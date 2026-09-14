import { Schema, model } from 'mongoose';
import { IGoal } from './goal.interface';

const goalSchema = new Schema<IGoal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    target: {
      type: Number,
      required: [true, 'Target is required'],
      min: [1, 'Target must be at least 1'],
    },
    deadline: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Goal = model<IGoal>('Goal', goalSchema);
