import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../modules/user/user.model';
import { Subject } from '../modules/subject/subject.model';
import { Task } from '../modules/task/task.model';
import { Goal } from '../modules/goal/goal.model';

const DEMO_EMAIL = 'demo@studyflow.app';
const DEMO_PASSWORD = 'demo1234';

const SUBJECTS = [
  { name: 'Math', color: '#0E7C66' },
  { name: 'Physics', color: '#3B6FE0' },
  { name: 'English', color: '#D99A22' },
  { name: 'Chemistry', color: '#B4479B' },
  { name: 'Biology', color: '#5B8C2A' },
];

const daysFromToday = (offset: number): Date => {
  const date = new Date();
  date.setUTCHours(9, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
};

const run = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding');

  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    await Task.deleteMany({ user: existingUser._id });
    await Goal.deleteMany({ user: existingUser._id });
    await Subject.deleteMany({ user: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
    console.log('Wiped existing demo data');
  }

  const user = await User.create({
    name: 'Demo Student',
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    dailyGoal: 5,
    theme: 'light',
  });
  console.log('Created demo user:', user.email);

  const subjects = await Subject.insertMany(
    SUBJECTS.map((s) => ({ ...s, user: user._id }))
  );
  const [math, physics, english, chemistry, biology] = subjects;
  console.log(`Created ${subjects.length} subjects`);

  const goals = await Goal.insertMany([
    {
      user: user._id,
      title: 'Finish integration practice set',
      subject: math._id,
      target: 10,
      deadline: daysFromToday(5),
    },
    {
      user: user._id,
      title: 'Complete thermodynamics revision',
      subject: physics._id,
      target: 8,
      deadline: daysFromToday(10),
    },
    {
      user: user._id,
      title: 'Read and annotate 3 short stories',
      subject: english._id,
      target: 3,
      deadline: daysFromToday(-2),
    },
  ]);
  const [calcGoal, thermoGoal, readGoal] = goals;
  console.log(`Created ${goals.length} goals`);

  interface TaskSeed {
    title: string;
    subject: mongoose.Types.ObjectId;
    goal?: mongoose.Types.ObjectId;
    priority: 'low' | 'medium' | 'high';
    dueOffset: number;
    minutes: number;
    completed: boolean;
    completedOffset?: number;
  }

  const taskSeeds: TaskSeed[] = [
    { title: 'Solve 10 integration problems', subject: math._id, goal: calcGoal._id, priority: 'high', dueOffset: -6, minutes: 45, completed: true, completedOffset: -6 },
    { title: 'Review derivative rules', subject: math._id, goal: calcGoal._id, priority: 'medium', dueOffset: -5, minutes: 30, completed: true, completedOffset: -5 },
    { title: 'Practice limits and continuity', subject: math._id, goal: calcGoal._id, priority: 'medium', dueOffset: -4, minutes: 40, completed: true, completedOffset: -4 },
    { title: 'Watch lecture on partial fractions', subject: math._id, goal: calcGoal._id, priority: 'low', dueOffset: -3, minutes: 25, completed: true, completedOffset: -3 },
    { title: 'Attempt past paper: calculus section', subject: math._id, goal: calcGoal._id, priority: 'high', dueOffset: 2, minutes: 60, completed: false },
    { title: 'Summarize Newton\'s laws of motion', subject: physics._id, goal: thermoGoal._id, priority: 'medium', dueOffset: -6, minutes: 35, completed: true, completedOffset: -6 },
    { title: 'Solve thermodynamics problem set 1', subject: physics._id, goal: thermoGoal._id, priority: 'high', dueOffset: -2, minutes: 50, completed: true, completedOffset: -2 },
    { title: 'Draw free-body diagrams for 5 problems', subject: physics._id, priority: 'medium', dueOffset: -1, minutes: 30, completed: true, completedOffset: -1 },
    { title: 'Read chapter on heat engines', subject: physics._id, goal: thermoGoal._id, priority: 'medium', dueOffset: 1, minutes: 40, completed: false },
    { title: 'Revise units and dimensional analysis', subject: physics._id, priority: 'low', dueOffset: 3, minutes: 20, completed: false },
    { title: 'Write essay outline on "The Great Gatsby"', subject: english._id, priority: 'medium', dueOffset: -5, minutes: 35, completed: true, completedOffset: -5 },
    { title: 'Read short story: "The Lottery"', subject: english._id, goal: readGoal._id, priority: 'low', dueOffset: -3, minutes: 25, completed: true, completedOffset: -3 },
    { title: 'Annotate poem for literary devices', subject: english._id, goal: readGoal._id, priority: 'medium', dueOffset: 0, minutes: 30, completed: true, completedOffset: 0 },
    { title: 'Draft persuasive essay introduction', subject: english._id, goal: readGoal._id, priority: 'high', dueOffset: 2, minutes: 45, completed: false },
    { title: 'Balance 15 chemical equations', subject: chemistry._id, priority: 'high', dueOffset: -4, minutes: 40, completed: true, completedOffset: -4 },
    { title: 'Memorize periodic table trends', subject: chemistry._id, priority: 'medium', dueOffset: -1, minutes: 30, completed: true, completedOffset: -1 },
    { title: 'Complete titration lab report', subject: chemistry._id, priority: 'high', dueOffset: 1, minutes: 55, completed: false },
    { title: 'Review acid-base reactions', subject: chemistry._id, priority: 'low', dueOffset: 3, minutes: 25, completed: false },
    { title: 'Label diagram of the human cell', subject: biology._id, priority: 'low', dueOffset: -2, minutes: 20, completed: true, completedOffset: -2 },
    { title: 'Summarize photosynthesis process', subject: biology._id, priority: 'medium', dueOffset: 0, minutes: 35, completed: true, completedOffset: 0 },
    { title: 'Study mitosis vs meiosis differences', subject: biology._id, priority: 'medium', dueOffset: 2, minutes: 30, completed: false },
  ];

  await Task.insertMany(
    taskSeeds.map((t) => ({
      user: user._id,
      title: t.title,
      subject: t.subject,
      goal: t.goal ?? null,
      priority: t.priority,
      dueDate: daysFromToday(t.dueOffset),
      minutes: t.minutes,
      completed: t.completed,
      completedAt: t.completed && t.completedOffset !== undefined ? daysFromToday(t.completedOffset) : null,
    }))
  );
  console.log(`Created ${taskSeeds.length} tasks`);

  console.log('\nSeed complete.');
  console.log(`Demo login -> email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
