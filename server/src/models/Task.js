const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  taskName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['completed', 'not_started', 'incomplete', 'in_progress'],
    default: 'not_started'
  },
  note: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: null
  },
  recurrence: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'custom', 'none'],
      default: 'none'
    },
    days: [{
      type: Number,
      min: 0,
      max: 6
    }]
  },
  focusMinutes: {
    type: Number,
    default: 0
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.index({ userId: 1, date: 1, timeSlot: 1 });
taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, 'recurrence.type': 1 });

module.exports = mongoose.model('Task', taskSchema);