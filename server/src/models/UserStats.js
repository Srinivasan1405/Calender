const mongoose = require('mongoose');
const Task = require('./Task');

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 0
  },
  totalTasksCompleted: {
    type: Number,
    default: 0
  },
  totalFocusMinutes: {
    type: Number,
    default: 0
  },
  badges: [{
    id: String,
    name: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  streaks: {
    current: {
      type: Number,
      default: 0
    },
    best: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: String,
      default: null
    },
    lastCompletedDate: {
      type: String,
      default: null
    }
  },
  achievements: {
    perfectDay: { type: Number, default: 0 },
    weekStreak: { type: Number, default: 0 },
    monthStreak: { type: Number, default: 0 },
    earlyBird: { type: Number, default: 0 },
    nightOwl: { type: Number, default: 0 },
    focusedHours: { type: Number, default: 0 },
    taskMaster: { type: Number, default: 0 }
  },
  weeklyXP: {
    type: Number,
    default: 0
  },
  monthlyXP: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userStatsSchema.methods.calculateLevel = function() {
  return Math.floor(this.xp / 100) + 1;
};

userStatsSchema.methods.xpToNextLevel = function() {
  return 100 - (this.xp % 100);
};

userStatsSchema.methods.updateStreak = async function(date) {
  const today = date || new Date().toISOString().split('T')[0];
  const lastDate = this.streaks.lastCompletedDate;
  
  if (!lastDate) {
    this.streaks.current = 1;
  } else if (lastDate === today) {
    return;
  } else {
    const last = new Date(lastDate);
    const current = new Date(today);
    const diffDays = Math.floor((current - last) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.streaks.current += 1;
    } else if (diffDays > 1) {
      this.streaks.current = 1;
    }
  }
  
  if (this.streaks.current > this.streaks.best) {
    this.streaks.best = this.streaks.current;
  }
  
  this.streaks.lastCompletedDate = today;
  this.streaks.lastUpdated = new Date().toISOString();
  
  await this.save();
};

userStatsSchema.statics.updateUserStreak = async function(userId, date) {
  let stats = await this.findOne({ userId });
  if (!stats) {
    stats = new this({ userId });
  }
  await stats.updateStreak(date);
  return stats;
};

module.exports = mongoose.model('UserStats', userStatsSchema);