const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'study', 'birthday'],
    default: 'personal'
  },
  description: {
    type: String,
    default: ''
  },
  reminder: {
    type: Boolean,
    default: false
  },
  reminderMinutes: {
    type: Number,
    default: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);