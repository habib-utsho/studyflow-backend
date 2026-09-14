import { FilterQuery } from 'mongoose';
import { Task } from './task.model';
import { ITask } from './task.interface';
import { Subject } from '../subject/subject.model';
import { Goal } from '../goal/goal.model';
import { ApiError } from '../../utils/ApiError';
import { Meta } from '../../utils/sendResponse';
import { CreateTaskInput, UpdateTaskInput, GetTasksQuery } from './task.validation';

const SUBJECT_POPULATE = 'name color';

const assertSubjectOwnership = async (userId: string, subjectId: string): Promise<void> => {
  const subject = await Subject.findOne({ _id: subjectId, user: userId });
  if (!subject) {
    throw ApiError.badRequest('Subject not found');
  }
};

const assertGoalOwnership = async (userId: string, goalId: string): Promise<void> => {
  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) {
    throw ApiError.badRequest('Goal not found');
  }
};

const getDueDateRange = (due: 'today' | 'week' | 'overdue') => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  if (due === 'today') {
    return { $gte: startOfToday, $lt: startOfTomorrow };
  }
  if (due === 'week') {
    const weekFromNow = new Date(startOfToday);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return { $gte: startOfToday, $lt: weekFromNow };
  }
  return { $lt: startOfToday };
};

export const getTasks = async (
  userId: string,
  query: GetTasksQuery
): Promise<{ tasks: ITask[]; meta: Meta }> => {
  const filter: FilterQuery<ITask> = { user: userId };

  if (query.completed !== undefined) {
    filter.completed = query.completed === 'true';
  }
  if (query.priority) {
    filter.priority = query.priority;
  }
  if (query.subject) {
    filter.subject = query.subject;
  }
  if (query.due) {
    filter.dueDate = getDueDateRange(query.due);
    if (query.due === 'overdue' && filter.completed === undefined) {
      filter.completed = false;
    }
  }
  if (query.search) {
    filter.title = { $regex: query.search, $options: 'i' };
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;
  const sort = query.sort ?? '-createdAt';

  const [tasks, total] = await Promise.all([
    Task.find(filter).populate('subject', SUBJECT_POPULATE).sort(sort).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  return { tasks, meta: { page, limit, total } };
};

export const getTaskById = async (userId: string, id: string): Promise<ITask> => {
  const task = await Task.findOne({ _id: id, user: userId }).populate('subject', SUBJECT_POPULATE);
  if (!task) {
    throw ApiError.notFound('Task not found');
  }
  return task;
};

export const createTask = async (userId: string, data: CreateTaskInput): Promise<ITask> => {
  if (data.subject) await assertSubjectOwnership(userId, data.subject);
  if (data.goal) await assertGoalOwnership(userId, data.goal);

  const task = await Task.create({ ...data, user: userId });
  return getTaskById(userId, task._id.toString());
};

export const updateTask = async (userId: string, id: string, data: UpdateTaskInput): Promise<ITask> => {
  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  if (data.subject !== undefined) {
    if (data.subject) await assertSubjectOwnership(userId, data.subject);
    task.subject = data.subject as unknown as ITask['subject'];
  }
  if (data.goal !== undefined) {
    if (data.goal) await assertGoalOwnership(userId, data.goal);
    task.goal = data.goal as unknown as ITask['goal'];
  }
  if (data.title !== undefined) task.title = data.title;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate;
  if (data.minutes !== undefined) task.minutes = data.minutes;
  if (data.completed !== undefined) {
    task.completed = data.completed;
    task.completedAt = data.completed ? new Date() : null;
  }

  await task.save();
  return getTaskById(userId, id);
};

export const toggleTask = async (userId: string, id: string): Promise<ITask> => {
  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) {
    throw ApiError.notFound('Task not found');
  }
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  await task.save();
  return getTaskById(userId, id);
};

export const deleteTask = async (userId: string, id: string): Promise<void> => {
  const task = await Task.findOneAndDelete({ _id: id, user: userId });
  if (!task) {
    throw ApiError.notFound('Task not found');
  }
};

export const deleteCompletedTasks = async (userId: string): Promise<{ deletedCount: number }> => {
  const result = await Task.deleteMany({ user: userId, completed: true });
  return { deletedCount: result.deletedCount ?? 0 };
};
