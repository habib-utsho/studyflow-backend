import { Subject } from './subject.model';
import { ISubject } from './subject.interface';
import { Task } from '../task/task.model';
import { ApiError } from '../../utils/ApiError';
import { CreateSubjectInput, UpdateSubjectInput } from './subject.validation';

export interface SubjectWithCounts {
  _id: string;
  user: string;
  name: string;
  color: string;
  taskCount: number;
  completedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const attachCounts = async (userId: string, subjects: ISubject[]): Promise<SubjectWithCounts[]> => {
  if (subjects.length === 0) return [];

  const subjectIds = subjects.map((s) => s._id);
  const counts = await Task.aggregate<{ _id: unknown; total: number; completed: number }>([
    { $match: { user: subjects[0].user, subject: { $in: subjectIds } } },
    {
      $group: {
        _id: '$subject',
        total: { $sum: 1 },
        completed: { $sum: { $cond: ['$completed', 1, 0] } },
      },
    },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c]));

  return subjects.map((subject) => {
    const count = countMap.get(subject._id.toString());
    return {
      _id: subject._id.toString(),
      user: userId,
      name: subject.name,
      color: subject.color,
      taskCount: count?.total ?? 0,
      completedCount: count?.completed ?? 0,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  });
};

export const getSubjects = async (userId: string): Promise<SubjectWithCounts[]> => {
  const subjects = await Subject.find({ user: userId }).sort('name');
  return attachCounts(userId, subjects);
};

export const createSubject = async (userId: string, data: CreateSubjectInput): Promise<SubjectWithCounts> => {
  const subject = await Subject.create({ ...data, user: userId });
  const [withCounts] = await attachCounts(userId, [subject]);
  return withCounts;
};

export const updateSubject = async (
  userId: string,
  id: string,
  data: UpdateSubjectInput
): Promise<SubjectWithCounts> => {
  const subject = await Subject.findOne({ _id: id, user: userId });
  if (!subject) {
    throw ApiError.notFound('Subject not found');
  }
  if (data.name !== undefined) subject.name = data.name;
  if (data.color !== undefined) subject.color = data.color;
  await subject.save();
  const [withCounts] = await attachCounts(userId, [subject]);
  return withCounts;
};

export const deleteSubject = async (userId: string, id: string): Promise<void> => {
  const subject = await Subject.findOneAndDelete({ _id: id, user: userId });
  if (!subject) {
    throw ApiError.notFound('Subject not found');
  }
  await Task.updateMany({ user: userId, subject: id }, { $set: { subject: null } });
};
