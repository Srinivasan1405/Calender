const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  defaultRoutine: Array,
  createdAt: Date
});

const User = mongoose.model('User', userSchema, 'users');

const newRoutine = [
  { timeSlot: '05:30', taskName: 'WAKE UP AT 5.30' },
  { timeSlot: '06:00', taskName: 'DON\'T USE MOBILE ON MORNING' },
  { timeSlot: '06:30', taskName: '30 PUSH UPS' },
  { timeSlot: '07:00', taskName: 'TYPING 20 MIN' },
  { timeSlot: '08:00', taskName: 'READ BOOK' },
  { timeSlot: '09:00', taskName: 'PROGRAMMING LANGUAGE' },
  { timeSlot: '10:00', taskName: 'LEARN CODE' },
  { timeSlot: '11:00', taskName: 'SSC TOPICS COVER 1' },
  { timeSlot: '12:00', taskName: 'LEARN NEW THINGS' },
  { timeSlot: '14:00', taskName: 'DRIVING CLASS' },
  { timeSlot: '18:00', taskName: 'INSTA LESS THAN 2 HRS' },
  { timeSlot: '20:00', taskName: 'Review Day' },
  { timeSlot: '21:00', taskName: 'Prepare for Sleep' },
  { timeSlot: '22:00', taskName: 'Sleep' }
];

async function updateRoutine() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { email: 'demo@example.com' },
      { $set: { defaultRoutine: newRoutine } }
    );
    
    console.log(`Updated ${result.modifiedCount} user(s)`);
    
    const demoUser = await User.findOne({ email: 'demo@example.com' });
    if (demoUser) {
      console.log('Demo user routine:', demoUser.defaultRoutine);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updateRoutine();