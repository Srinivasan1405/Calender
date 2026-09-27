const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const getDateRange = (days) => {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

router.get('/daily', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = { userId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      const dates = getDateRange(7);
      query.date = { $in: dates };
    }

    const tasks = await Task.find(query);

    const dailyStats = {};
    tasks.forEach(task => {
      if (!dailyStats[task.date]) {
        dailyStats[task.date] = { total: 0, completed: 0 };
      }
      dailyStats[task.date].total += 1;
      if (task.status === 'completed') {
        dailyStats[task.date].completed += 1;
      }
    });

    const result = Object.keys(dailyStats).map(date => ({
      date,
      totalTasks: dailyStats[date].total,
      completedTasks: dailyStats[date].completed,
      successRate: (dailyStats[date].completed / dailyStats[date].total) * 100
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/weekly', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const weeks = parseInt(req.query.weeks) || 4;

    const allDates = getDateRange(weeks * 7);
    const tasks = await Task.find({
      userId,
      date: { $in: allDates }
    });

    const dailyStats = {};
    tasks.forEach(task => {
      if (!dailyStats[task.date]) {
        dailyStats[task.date] = { total: 0, completed: 0 };
      }
      dailyStats[task.date].total += 1;
      if (task.status === 'completed') {
        dailyStats[task.date].completed += 1;
      }
    });

    const weeklyData = [];
    for (let i = 0; i < weeks; i++) {
      const weekStart = allDates[i * 7];
      const weekEnd = allDates[(i + 1) * 7 - 1];
      const weekDates = allDates.slice(i * 7, (i + 1) * 7);

      let totalTasks = 0;
      let completedTasks = 0;

      weekDates.forEach(date => {
        if (dailyStats[date]) {
          totalTasks += dailyStats[date].total;
          completedTasks += dailyStats[date].completed;
        }
      });

      weeklyData.push({
        week: `Week ${i + 1}`,
        weekStart,
        weekEnd,
        totalTasks,
        completedTasks,
        successRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      });
    }

    res.json(weeklyData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const tasks = await Task.find({
      userId,
      date: { $gte: thirtyDaysAgoStr }
    });

    const dailyStats = {};
    tasks.forEach(task => {
      if (!dailyStats[task.date]) {
        dailyStats[task.date] = { total: 0, completed: 0 };
      }
      dailyStats[task.date].total += 1;
      if (task.status === 'completed') {
        dailyStats[task.date].completed += 1;
      }
    });

    const dailyRates = Object.keys(dailyStats).map(date => ({
      date,
      successRate: dailyStats[date].total > 0 
        ? (dailyStats[date].completed / dailyStats[date].total) * 100 
        : 0
    }));

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    const sortedDates = Object.keys(dailyStats).sort().reverse();
    
    for (const date of sortedDates) {
      const rate = dailyStats[date].total > 0 
        ? (dailyStats[date].completed / dailyStats[date].total) * 100 
        : 0;
      
      if (rate >= 80) {
        tempStreak += 1;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    for (const date of sortedDates) {
      if (date > today) continue;
      const rate = dailyStats[date].total > 0 
        ? (dailyStats[date].completed / dailyStats[date].total) * 100 
        : 0;
      
      if (rate >= 80) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    const averageSuccessRate = dailyRates.length > 0
      ? dailyRates.reduce((sum, d) => sum + d.successRate, 0) / dailyRates.length
      : 0;

    const totalTasksLast30 = tasks.length;
    const completedTasksLast30 = tasks.filter(t => t.status === 'completed').length;

    res.json({
      currentStreak,
      bestStreak,
      averageSuccessRate,
      totalTasksLast30,
      completedTasksLast30,
      completedVsNotCompleted: {
        completed: completedTasksLast30,
        notCompleted: totalTasksLast30 - completedTasksLast30
      },
      dailyPerformance: dailyRates.sort((a, b) => a.date.localeCompare(b.date))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/heatmap', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 90;
    const allDates = getDateRange(days);

    const tasks = await Task.find({
      userId,
      date: { $in: allDates }
    });

    const heatmapData = {};
    tasks.forEach(task => {
      if (!heatmapData[task.date]) {
        heatmapData[task.date] = { total: 0, completed: 0 };
      }
      heatmapData[task.date].total += 1;
      if (task.status === 'completed') {
        heatmapData[task.date].completed += 1;
      }
    });

    const result = allDates.map(date => {
      const stats = heatmapData[date] || { total: 0, completed: 0 };
      const successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      
      let color = '#e5e7eb';
      if (stats.total > 0) {
        if (successRate >= 80) color = '#10b981';
        else if (successRate >= 50) color = '#f59e0b';
        else color = '#ef4444';
      }

      return {
        date,
        totalTasks: stats.total,
        completedTasks: stats.completed,
        successRate,
        color
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;