const express = require('express');
const router = express.Router();
const FocusSession = require('../models/FocusSession');
const auth = require('../middleware/auth');

router.post('/start', auth, async (req, res) => {
  try {
    const { taskId, type, date } = req.body;
    
    const session = new FocusSession({
      userId: req.user.id,
      taskId,
      date: date || new Date().toISOString().split('T')[0],
      startTime: new Date(),
      type: type || 'pomodoro_25'
    });

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id/end', auth, async (req, res) => {
  try {
    const session = await FocusSession.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    session.endTime = new Date();
    session.duration = Math.round((session.endTime - session.startTime) / 60000);
    session.completed = true;

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sessions = await FocusSession.find({
      userId: req.user.id,
      date: today
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const completedSessions = sessions.filter(s => s.completed).length;

    res.json({
      sessions,
      totalMinutes,
      completedSessions,
      todayGoal: 120
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const sessions = await FocusSession.find({
      userId: req.user.id,
      date: { $gte: startDateStr }
    });

    const dailyStats = {};
    sessions.forEach(session => {
      if (!dailyStats[session.date]) {
        dailyStats[session.date] = { minutes: 0, sessions: 0 };
      }
      dailyStats[session.date].minutes += session.duration || 0;
      dailyStats[session.date].sessions += 1;
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgPerDay = days > 0 ? Math.round(totalMinutes / days) : 0;

    res.json({
      totalMinutes,
      avgPerDay,
      totalSessions: sessions.length,
      dailyStats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;