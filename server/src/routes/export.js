const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Note = require('../models/Note');
const Goal = require('../models/Goal');
const FocusSession = require('../models/FocusSession');
const auth = require('../middleware/auth');

router.get('/all', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const [tasks, notes, goals, focusSessions] = await Promise.all([
      Task.find({ userId: req.user.id, date: { $gte: startDateStr } }),
      Note.find({ userId: req.user.id }),
      Goal.find({ userId: req.user.id }),
      FocusSession.find({ userId: req.user.id, date: { $gte: startDateStr } })
    ]);

    res.json({
      tasks,
      notes,
      goals,
      focusSessions,
      exportedAt: new Date().toISOString(),
      totalRecords: tasks.length + notes.length + goals.length + focusSessions.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/csv/tasks', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const tasks = await Task.find({
      userId: req.user.id,
      date: { $gte: startDateStr }
    }).sort({ date: -1, timeSlot: 1 });

    const csv = [
      ['Date', 'Time', 'Task', 'Status', 'Category', 'Notes'].join(','),
      ...tasks.map(t => [
        t.date,
        t.timeSlot,
        `"${t.taskName}"`,
        t.status,
        t.category || '',
        `"${(t.note || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const [tasks, goals, focusSessions] = await Promise.all([
      Task.find({ userId: req.user.id }),
      Goal.find({ userId: req.user.id }),
      FocusSession.find({ userId: req.user.id })
    ]);

    const summary = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      totalFocusMinutes: focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      totalFocusSessions: focusSessions.length,
      generatedAt: new Date().toISOString()
    };

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;