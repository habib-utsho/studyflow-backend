import { Schema, model } from 'mongoose';
import { ISubject } from './subject.interface';

const subjectSchema = new Schema<ISubject>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      minlength: [1, 'Subject name must be at least 1 character'],
      maxlength: [40, 'Subject name cannot exceed 40 characters'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color must be a valid hex code'],
    },
  },
  { timestamps: true }
);

subjectSchema.index({ user: 1, name: 1 }, { unique: true });

export const Subject = model<ISubject>('Subject', subjectSchema);
