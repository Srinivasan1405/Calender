const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

router.post('/bulk', auth, async (req, res) => {
  try {
    const { type, titles, description } = req.body;
    const userId = req.user.id;

    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return res.status(400).json({ msg: 'Titles array is required' });
    }

    const goals = titles.map(title => ({
      userId,
      type: type || 'monthly',
      title: title.trim(),
      description: description || '',
      progress: 0,
      status: 'not_started',
    }));

    const created = await Goal.insertMany(goals);
    res.json(created);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { type, title, description, progress, status, deadline, linkedYearlyGoal } = req.body;
    const userId = req.user.id;

    const goal = new Goal({
      userId,
      type,
      title,
      description: description || '',
      progress: progress || 0,
      status: status || 'not_started',
      deadline: deadline || null,
      linkedYearlyGoal: linkedYearlyGoal || null
    });

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;
    
    const query = { userId };
    if (type) {
      query.type = type;
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, progress, status, deadline, linkedYearlyGoal } = req.body;
    
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (progress !== undefined) goal.progress = progress;
    if (status) goal.status = status;
    if (deadline !== undefined) goal.deadline = deadline;
    if (linkedYearlyGoal !== undefined) goal.linkedYearlyGoal = linkedYearlyGoal;
    goal.updatedAt = Date.now();

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await goal.deleteOne();
    res.json({ msg: 'Goal deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;