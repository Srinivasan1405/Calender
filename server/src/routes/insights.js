const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Note = require('../models/Note');
const FocusSession = require('../models/FocusSession');
const auth = require('../middleware/auth');

router.get('/daily', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const performanceByDay = {};
    dayNames.forEach(day => performanceByDay[day] = { total: 0, completed: 0 });

    const timeSlotPerformance = {};

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().split('T')[0];

    const tasks = await Task.find({
      userId: req.user.id,
      date: { $gte: startDateStr }
    });

    tasks.forEach(task => {
      const dayOfWeek = dayNames[new Date(task.date).getDay()];

      performanceByDay[dayOfWeek].total += 1;
      if (task.status === 'completed') {
        performanceByDay[dayOfWeek].completed += 1;
      }

      if (!timeSlotPerformance[task.timeSlot]) {
        timeSlotPerformance[task.timeSlot] = { total: 0, completed: 0 };
      }
      timeSlotPerformance[task.timeSlot].total += 1;
      if (task.status === 'completed') {
        timeSlotPerformance[task.timeSlot].completed += 1;
      }
    });

    const bestDay = Object.entries(performanceByDay)
      .filter(([_, data]) => data.total > 0)
      .map(([day, data]) => ({
        day,
        rate: Math.round((data.completed / data.total) * 100)
      }))
      .sort((a, b) => b.rate - a.rate)[0];

    const worstDay = Object.entries(performanceByDay)
      .filter(([_, data]) => data.total > 0)
      .map(([day, data]) => ({
        day,
        rate: Math.round((data.completed / data.total) * 100)
      }))
      .sort((a, b) => a.rate - b.rate)[0];

    const bestTimeSlot = Object.entries(timeSlotPerformance)
      .filter(([_, data]) => data.total >= 5)
      .map(([slot, data]) => ({
        timeSlot: slot,
        rate: Math.round((data.completed / data.total) * 100)
      }))
      .sort((a, b) => b.rate - a.rate)[0];

    const worstTimeSlot = Object.entries(timeSlotPerformance)
      .filter(([_, data]) => data.total >= 5)
      .map(([slot, data]) => ({
        timeSlot: slot,
        rate: Math.round((data.completed / data.total) * 100)
      }))
      .sort((a, b) => a.rate - b.rate)[0];

    const suggestions = [];
    if (bestDay) {
      suggestions.push(`You perform best on ${bestDay.day}s (${bestDay.rate}% success rate)`);
    }
    if (worstDay && worstDay.day !== bestDay?.day) {
      suggestions.push(`Your performance tends to drop on ${worstDay.day}s`);
    }
    if (bestTimeSlot) {
      suggestions.push(`You are most productive around ${bestTimeSlot.timeSlot}`);
    }
    if (worstTimeSlot && worstTimeSlot.timeSlot !== bestTimeSlot?.timeSlot) {
      suggestions.push(`Tasks after ${worstTimeSlot.timeSlot} need more attention`);
    }

    res.json({
      performanceByDay: Object.entries(performanceByDay).map(([day, data]) => ({
        day,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        tasksCompleted: data.completed
      })),
      timeSlotPerformance: Object.entries(timeSlotPerformance).map(([slot, data]) => ({
        timeSlot: slot,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      })),
      bestDay,
      worstDay,
      bestTimeSlot,
      worstTimeSlot,
      suggestions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/predictions', auth, async (req, res) => {
  try {
    const days = 30;
    let onTrack = true;
    const warnings = [];

    const tasks = await Task.find({
      userId: req.user.id,
      date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
    });

    const recentTasks = tasks.filter(t => {
      const taskDate = new Date(t.date);
      return (Date.now() - taskDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
    });

    if (recentTasks.length > 0) {
      const recentCompleted = recentTasks.filter(t => t.status === 'completed').length;
      const recentRate = recentCompleted / recentTasks.length;

      if (recentRate < 0.5) {
        onTrack = false;
        warnings.push('Your completion rate has dropped below 50% this week');
      }
    }

    res.json({
      onTrack,
      warnings,
      encouragement: onTrack ? 'Keep up the great work! You are on track.' : 'Focus more on completing your daily tasks.'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;