const mongoose = require('mongoose');

const dailyStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  totalTasks: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
});

dailyStatsSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('DailyStats', dailyStatsSchema);