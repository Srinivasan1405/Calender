const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const CATEGORIES = ['work', 'personal', 'study', 'birthday'];

router.post('/', auth, async (req, res) => {
  try {
    const { title, date, time, category, description, reminder, reminderMinutes } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ msg: 'Title and date are required' });
    }

    const event = new Event({
      userId: req.user.id,
      title,
      date,
      time: time || '',
      category: CATEGORIES.includes(category) ? category : 'personal',
      description: description || '',
      reminder: reminder || false,
      reminderMinutes: reminderMinutes || 30
    });

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const events = await Event.find({ userId: req.user.id, date }).sort({ time: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/month/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const events = await Event.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1, time: 1 });
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/search', auth, async (req, res) => {
  try {
    const { q, category } = req.query;
    let query = { userId: req.user.id };
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category && CATEGORIES.includes(category)) {
      query.category = category;
    }
    
    const events = await Event.find(query).sort({ date: -1, time: 1 }).limit(50);
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, date, time, category, description, reminder, reminderMinutes } = req.body;
    
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    if (event.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    if (title) event.title = title;
    if (date) event.date = date;
    if (time !== undefined) event.time = time;
    if (category && CATEGORIES.includes(category)) event.category = category;
    if (description !== undefined) event.description = description;
    if (reminder !== undefined) event.reminder = reminder;
    if (reminderMinutes) event.reminderMinutes = reminderMinutes;
    
    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    if (event.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await event.deleteOne();
    res.json({ msg: 'Event deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;