const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { date, content, mood } = req.body;
    const userId = req.user.id;

    let note = await Note.findOne({ userId, date });

    if (note) {
      note.content = content || note.content;
      note.mood = mood || note.mood;
      note.updatedAt = Date.now();
      await note.save();
    } else {
      note = new Note({
        userId,
        date,
        content: content || '',
        mood: mood || ''
      });
      await note.save();
    }

    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    let note = await Note.findOne({ userId, date });

    if (!note) {
      note = { date, content: '', mood: '' };
    }

    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notes = await Note.find({ userId }).sort({ date: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;