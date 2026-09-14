import { Goal } from './goal.model';
import { IGoal } from './goal.interface';
import { Task } from '../task/task.model';
import { ITask } from '../task/task.interface';
import { Subject } from '../subject/subject.model';
import { ApiError } from '../../utils/ApiError';
import { CreateGoalInput, UpdateGoalInput } from './goal.validation';

export interface GoalWithProgress {
  _id: string;
  user: string;
  title: string;
  subject: IGoal['subject'];
  target: number;
  deadline: IGoal['deadline'];
  completed: number;
  createdAt: Date;
  updatedAt: Date;
}

const assertSubjectOwnership = async (userId: string, subjectId: string): Promise<void> => {
  const subject = await Subject.findOne({ _id: subjectId, user: userId });
  if (!subject) {
    throw ApiError.badRequest('Subject not found');
  }
};

const attachProgress = async (userId: string, goals: IGoal[]): Promise<GoalWithProgress[]> => {
  const goalIds = goals.map((g) => g._id);
  const counts = await Task.aggregate<{ _id: unknown; count: number }>([
    { $match: { user: goals[0]?.user, goal: { $in: goalIds }, completed: true } },
    { $group: { _id: '$goal', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return goals.map((goal) => ({
    _id: goal._id.toString(),
    user: userId,
    title: goal.title,
    subject: goal.subject,
    target: goal.target,
    deadline: goal.deadline,
    completed: countMap.get(goal._id.toString()) ?? 0,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  }));
};

export const getGoals = async (userId: string): Promise<GoalWithProgress[]> => {
  const goals = await Goal.find({ user: userId }).populate('subject', 'name color').sort('-createdAt');
  if (goals.length === 0) return [];
  return attachProgress(userId, goals);
};

export const getGoalById = async (
  userId: string,
  id: string
): Promise<GoalWithProgress & { tasks: ITask[] }> => {
  const goal = await Goal.findOne({ _id: id, user: userId }).populate('subject', 'name color');
  if (!goal) {
    throw ApiError.notFound('Goal not found');
  }
  const [withProgress] = await attachProgress(userId, [goal]);
  const tasks = await Task.find({ user: userId, goal: id }).populate('subject', 'name color').sort('-createdAt');

  return { ...withProgress, tasks };
};

export const createGoal = async (userId: string, data: CreateGoalInput): Promise<GoalWithProgress> => {
  if (data.subject) await assertSubjectOwnership(userId, data.subject);
  const goal = await Goal.create({ ...data, user: userId });
  const populated = await Goal.findById(goal._id).populate('subject', 'name color');
  const [withProgress] = await attachProgress(userId, [populated as IGoal]);
  return withProgress;
};

export const updateGoal = async (userId: string, id: string, data: UpdateGoalInput): Promise<GoalWithProgress> => {
  const goal = await Goal.findOne({ _id: id, user: userId });
  if (!goal) {
    throw ApiError.notFound('Goal not found');
  }

  if (data.subject !== undefined) {
    if (data.subject) await assertSubjectOwnership(userId, data.subject);
    goal.subject = data.subject as unknown as IGoal['subject'];
  }
  if (data.title !== undefined) goal.title = data.title;
  if (data.target !== undefined) goal.target = data.target;
  if (data.deadline !== undefined) goal.deadline = data.deadline;

  await goal.save();
  const populated = await Goal.findById(goal._id).populate('subject', 'name color');
  const [withProgress] = await attachProgress(userId, [populated as IGoal]);
  return withProgress;
};

export const deleteGoal = async (userId: string, id: string): Promise<void> => {
  const goal = await Goal.findOneAndDelete({ _id: id, user: userId });
  if (!goal) {
    throw ApiError.notFound('Goal not found');
  }
};
