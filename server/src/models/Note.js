const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  mood: {
    type: String,
    enum: ['happy', 'neutral', 'sad', ''],
    default: ''
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

noteSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Note', noteSchema);