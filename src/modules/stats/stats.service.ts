import mongoose from 'mongoose';
import { Task } from '../task/task.model';
import { Subject } from '../subject/subject.model';

const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);

export interface StatsOverview {
  totalTasks: number;
  completed: number;
  pending: number;
  streak: number;
  focusHours: number;
}

export interface WeeklyStatDay {
  date: string;
  total: number;
  completed: number;
}

export interface SubjectStat {
  subject: string;
  name: string;
  color: string;
  total: number;
  completed: number;
}

export const getOverview = async (userId: string): Promise<StatsOverview> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [totalTasks, completed, focusResult, streakDates] = await Promise.all([
    Task.countDocuments({ user: userObjectId }),
    Task.countDocuments({ user: userObjectId, completed: true }),
    Task.aggregate<{ _id: null; totalMinutes: number }>([
      { $match: { user: userObjectId, completed: true } },
      { $group: { _id: null, totalMinutes: { $sum: '$minutes' } } },
    ]),
    Task.aggregate<{ _id: string }>([
      { $match: { user: userObjectId, completed: true, completedAt: { $ne: null } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } } } },
    ]),
  ]);

  const totalMinutes = focusResult[0]?.totalMinutes ?? 0;
  const focusHours = Math.round((totalMinutes / 60) * 10) / 10;

  const completedDaySet = new Set(streakDates.map((d) => d._id));
  let streak = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  while (completedDaySet.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return {
    totalTasks,
    completed,
    pending: totalTasks - completed,
    streak,
    focusHours,
  };
};

export const getWeekly = async (userId: string): Promise<WeeklyStatDay[]> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 6);
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() + 1);

  const [dueBuckets, completedBuckets] = await Promise.all([
    Task.aggregate<{ _id: string; count: number }>([
      { $match: { user: userObjectId, dueDate: { $gte: start, $lt: end } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$dueDate' } }, count: { $sum: 1 } } },
    ]),
    Task.aggregate<{ _id: string; count: number }>([
      { $match: { user: userObjectId, completed: true, completedAt: { $gte: start, $lt: end } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
    ]),
  ]);

  const dueMap = new Map(dueBuckets.map((b) => [b._id, b.count]));
  const completedMap = new Map(completedBuckets.map((b) => [b._id, b.count]));

  const days: WeeklyStatDay[] = [];
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + i);
    const key = toDateKey(day);
    days.push({
      date: key,
      total: dueMap.get(key) ?? 0,
      completed: completedMap.get(key) ?? 0,
    });
  }

  return days;
};

export const getBySubject = async (userId: string): Promise<SubjectStat[]> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const subjects = await Subject.find({ user: userObjectId }).sort('name');
  const counts = await Task.aggregate<{ _id: unknown; total: number; completed: number }>([
    { $match: { user: userObjectId, subject: { $ne: null } } },
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
      subject: subject._id.toString(),
      name: subject.name,
      color: subject.color,
      total: count?.total ?? 0,
      completed: count?.completed ?? 0,
    };
  });
};
