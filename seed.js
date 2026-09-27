const mongoose = require('./server/node_modules/mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./server/src/models/User');
const Task = require('./server/src/models/Task');
const Note = require('./server/src/models/Note');
const Goal = require('./server/src/models/Goal');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/routine_tracker';
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  },
  {
    name: 'John Doe',
    email: 'demo@example.com',
    password: 'demo123'
  }
];

const generateTasks = (userId, startDate, days) => {
  const tasks = [];
  const template = [
    { timeSlot: '06:00', taskName: 'Morning Exercise' },
    { timeSlot: '07:00', taskName: 'Breakfast' },
    { timeSlot: '08:00', taskName: 'Work/Study' },
    { timeSlot: '09:00', taskName: 'Deep Work Session' },
    { timeSlot: '10:00', taskName: 'Break' },
    { timeSlot: '11:00', taskName: 'Work/Study' },
    { timeSlot: '12:00', taskName: 'Lunch' },
    { timeSlot: '13:00', taskName: 'Work/Study' },
    { timeSlot: '14:00', taskName: 'Deep Work Session' },
    { timeSlot: '15:00', taskName: 'Break' },
    { timeSlot: '16:00', taskName: 'Work/Study' },
    { timeSlot: '17:00', taskName: 'Exercise' },
    { timeSlot: '18:00', taskName: 'Dinner' },
    { timeSlot: '19:00', taskName: 'Personal Development' },
    { timeSlot: '20:00', taskName: 'Relaxation' },
    { timeSlot: '21:00', taskName: 'Prepare for Sleep' },
    { timeSlot: '22:00', taskName: 'Sleep' }
  ];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    template.forEach(task => {
      const completed = Math.random() > 0.3;
      tasks.push({
        userId,
        date: dateStr,
        timeSlot: task.timeSlot,
        taskName: task.taskName,
        status: completed ? 'completed' : 'not_started',
        note: ''
      });
    });
  }

  return tasks;
};

const generateNotes = (userId, startDate, days) => {
  const notes = [];
  const moods = ['happy', 'neutral', 'sad'];
  const contents = [
    'Great productive day!',
    'Could have been better.',
    'Need to focus more tomorrow.',
    'Felt motivated today.',
    'Struggled with some tasks.',
    'Steady progress.',
    'Learned something new!',
    'Need to rest more.'
  ];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    notes.push({
      userId,
      date: dateStr,
      content: contents[Math.floor(Math.random() * contents.length)],
      mood: moods[Math.floor(Math.random() * moods.length)]
    });
  }

  return notes;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Task.deleteMany({});
    await Note.deleteMany({});
    await Goal.deleteMany({});
    console.log('Cleared existing data');

    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
        defaultRoutine: [
          { timeSlot: '06:00', taskName: 'Morning Exercise' },
          { timeSlot: '07:00', taskName: 'Breakfast' },
          { timeSlot: '08:00', taskName: 'Work/Study' },
          { timeSlot: '09:00', taskName: 'Deep Work Session' },
          { timeSlot: '10:00', taskName: 'Break' },
          { timeSlot: '11:00', taskName: 'Work/Study' },
          { timeSlot: '12:00', taskName: 'Lunch' },
          { timeSlot: '13:00', taskName: 'Work/Study' },
          { timeSlot: '14:00', taskName: 'Deep Work Session' },
          { timeSlot: '15:00', taskName: 'Break' },
          { timeSlot: '16:00', taskName: 'Work/Study' },
          { timeSlot: '17:00', taskName: 'Exercise' },
          { timeSlot: '18:00', taskName: 'Dinner' },
          { timeSlot: '19:00', taskName: 'Personal Development' },
          { timeSlot: '20:00', taskName: 'Relaxation' },
          { timeSlot: '21:00', taskName: 'Prepare for Sleep' },
          { timeSlot: '22:00', taskName: 'Sleep' }
        ]
      }))
    );

    const users = await User.insertMany(hashedUsers);
    console.log(`Created ${users.length} users`);

    const user1Id = users[0]._id;
    const user2Id = users[1]._id;
    const user3Id = users[2]._id;

    const tasksUser1 = generateTasks(user1Id, new Date(), 60);
    const tasksUser2 = generateTasks(user2Id, new Date(), 45);
    const tasksUser3 = generateTasks(user3Id, new Date(), 60);
    
    await Task.insertMany([...tasksUser1, ...tasksUser2, ...tasksUser3]);
    console.log(`Created ${tasksUser1.length + tasksUser2.length + tasksUser3.length} tasks`);

    const notesUser1 = generateNotes(user1Id, new Date(), 60);
    const notesUser2 = generateNotes(user2Id, new Date(), 45);
    const notesUser3 = generateNotes(user3Id, new Date(), 60);
    
    await Note.insertMany([...notesUser1, ...notesUser2, ...notesUser3]);
    console.log(`Created ${notesUser1.length + notesUser2.length + notesUser3.length} notes`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const lastMonth = new Date(currentYear, currentMonth, 0);
    const endOfYear = new Date(currentYear, 11, 31);

    const yearlyGoals = [
      {
        userId: user1Id,
        type: 'yearly',
        title: 'Become Full Stack Developer',
        description: 'Master both frontend and backend technologies',
        progress: 65,
        status: 'in_progress',
        deadline: endOfYear
      },
      {
        userId: user1Id,
        type: 'yearly',
        title: 'Read 24 Books',
        description: 'One book per two weeks',
        progress: 42,
        status: 'in_progress',
        deadline: endOfYear
      },
      {
        userId: user2Id,
        type: 'yearly',
        title: 'Learn Data Science',
        description: 'Complete Data Science specialization',
        progress: 30,
        status: 'in_progress',
        deadline: endOfYear
      },
      {
        userId: user3Id,
        type: 'yearly',
        title: 'Become Full Stack Developer',
        description: 'Master both frontend and backend technologies',
        progress: 65,
        status: 'in_progress',
        deadline: endOfYear
      },
      {
        userId: user3Id,
        type: 'yearly',
        title: 'Read 24 Books',
        description: 'One book per two weeks',
        progress: 42,
        status: 'in_progress',
        deadline: endOfYear
      }
    ];

    const monthlyGoals = [
      {
        userId: user1Id,
        type: 'monthly',
        title: 'Complete React Course',
        description: 'Finish advanced React patterns course',
        progress: 80,
        status: 'in_progress',
        deadline: endOfMonth
      },
      {
        userId: user1Id,
        type: 'monthly',
        title: 'Morning Routine Consistency',
        description: 'Maintain morning routine for 30 days',
        progress: 100,
        status: 'completed',
        deadline: lastMonth
      },
      {
        userId: user2Id,
        type: 'monthly',
        title: 'Python Mastery',
        description: 'Complete Python programming course',
        progress: 55,
        status: 'in_progress',
        deadline: endOfMonth
      },
      {
        userId: user3Id,
        type: 'monthly',
        title: 'Complete React Course',
        description: 'Finish advanced React patterns course',
        progress: 80,
        status: 'in_progress',
        deadline: endOfMonth
      },
      {
        userId: user3Id,
        type: 'monthly',
        title: 'Morning Routine Consistency',
        description: 'Maintain morning routine for 30 days',
        progress: 100,
        status: 'completed',
        deadline: lastMonth
      }
    ];

    await Goal.insertMany([...yearlyGoals, ...monthlyGoals]);
    console.log(`Created ${yearlyGoals.length + monthlyGoals.length} goals`);

    console.log('\n✓ Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Email: demo@example.com | Password: demo123');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: jane@example.com | Password: password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();