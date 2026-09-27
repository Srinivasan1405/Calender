const express = require('express');
const router = express.Router();
const UserStats = require('../models/UserStats');
const auth = require('../middleware/auth');

const BADGES = [
  { id: 'first_task', name: 'First Step', icon: '🎯', description: 'Complete your first task' },
  { id: 'week_warrior', name: 'Week Warrior', icon: '🛡️', description: '7 day streak' },
  { id: 'month_master', name: 'Month Master', icon: '👑', description: '30 day streak' },
  { id: 'early_bird', name: 'Early Bird', icon: '🐦', description: 'Complete task before 7 AM' },
  { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Complete task after 10 PM' },
  { id: 'focused_10h', name: 'Deep Focus', icon: '🧠', description: '10 hours of focus time' },
  { id: 'perfect_day', name: 'Perfect Day', icon: '⭐', description: 'Complete all tasks in a day' },
  { id: 'level_10', name: 'Rising Star', icon: '🌟', description: 'Reach level 10' },
  { id: 'level_25', name: 'Habit Hero', icon: '🦸', description: 'Reach level 25' },
  { id: 'task_master', name: 'Task Master', icon: '🏆', description: 'Complete 100 tasks' },
  { id: 'streak_7', name: 'Week Streak', icon: '🔥', description: '7 day streak' },
  { id: 'streak_30', name: 'Month Streak', icon: '💎', description: '30 day streak' },
  { id: 'centurion', name: 'Centurion', icon: '💯', description: 'Complete 100 tasks' },
  { id: 'perfectionist', name: 'Perfectionist', icon: '✨', description: '10 perfect days' },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', description: 'Complete 5 tasks in one hour' }
];

const XP_RULES = {
  taskCompleted: 10,
  taskCompletedEarly: 5,
  streakBonus: 2,
  perfectDay: 50,
  focusSession25: 15,
  focusSession50: 30,
  goalCompleted: 100
};

router.get('/stats', auth, async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.user.id });
    
    if (!stats) {
      stats = new UserStats({ userId: req.user.id });
      await stats.save();
    }

    res.json({
      xp: stats.xp,
      level: stats.level,
      points: stats.points,
      xpToNextLevel: stats.xpToNextLevel(),
      totalTasksCompleted: stats.totalTasksCompleted,
      totalFocusMinutes: stats.totalFocusMinutes,
      badges: stats.badges,
      streaks: stats.streaks,
      weeklyXP: stats.weeklyXP,
      monthlyXP: stats.monthlyXP
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/task-completed', auth, async (req, res) => {
  try {
    const { taskId, completedEarly, date } = req.body;
    
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = new UserStats({ userId: req.user.id });
    }

    let xpEarned = XP_RULES.taskCompleted;
    if (completedEarly) xpEarned += XP_RULES.taskCompletedEarly;
    
    stats.xp += xpEarned;
    stats.points += xpEarned;
    stats.level = stats.calculateLevel();
    stats.totalTasksCompleted += 1;
    stats.weeklyXP += xpEarned;
    stats.monthlyXP += xpEarned;

    const taskDate = date || new Date().toISOString().split('T')[0];
    await stats.updateStreak(taskDate);
    
    await checkAndAwardBadges(stats, req.user.id);
    await stats.save();

    res.json({
      xpEarned,
      totalXP: stats.xp,
      level: stats.level,
      xpToNextLevel: stats.xpToNextLevel(),
      newBadges: stats.badges.slice(-1),
      streaks: stats.streaks
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/focus-completed', auth, async (req, res) => {
  try {
    const { minutes } = req.body;
    
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = new UserStats({ userId: req.user.id });
    }

    let xpEarned = minutes >= 50 ? XP_RULES.focusSession50 : XP_RULES.focusSession25;
    
    stats.xp += xpEarned;
    stats.points += xpEarned;
    stats.totalFocusMinutes += minutes;
    stats.level = stats.calculateLevel();
    stats.weeklyXP += xpEarned;
    stats.monthlyXP += xpEarned;

    await checkAndAwardBadges(stats, req.user.id);
    await stats.save();

    res.json({
      xpEarned,
      totalXP: stats.xp,
      level: stats.level
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/perfect-day', auth, async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = new UserStats({ userId: req.user.id });
    }

    stats.xp += XP_RULES.perfectDay;
    stats.points += XP_RULES.perfectDay;
    stats.level = stats.calculateLevel();
    stats.weeklyXP += XP_RULES.perfectDay;
    stats.monthlyXP += XP_RULES.perfectDay;
    stats.achievements.perfectDay += 1;

    await checkAndAwardBadges(stats, req.user.id);
    await stats.save();

    res.json({
      xpEarned: XP_RULES.perfectDay,
      totalXP: stats.xp,
      level: stats.level
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/badges', auth, async (req, res) => {
  try {
    const stats = await UserStats.findOne({ userId: req.user.id });
    const earned = stats?.badges || [];
    const earnedIds = earned.map(b => b.id);
    
    const availableBadges = BADGES.map(badge => ({
      ...badge,
      earned: earnedIds.includes(badge.id),
      earnedAt: earned.find(b => b.id === badge.id)?.earnedAt
    }));

    res.json(availableBadges);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaderboard = await UserStats.find()
      .sort({ xp: -1 })
      .limit(20)
      .populate('userId', 'name');

    const formatted = leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.userId?.name || 'Anonymous',
      xp: entry.xp,
      level: entry.level
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

const checkAndAwardBadges = async (stats, userId) => {
  const newBadges = [];
  
  if (stats.totalTasksCompleted >= 1 && !stats.badges.find(b => b.id === 'first_task')) {
    newBadges.push(BADGES.find(b => b.id === 'first_task'));
  }
  if (stats.streaks.current >= 7 && !stats.badges.find(b => b.id === 'streak_7')) {
    newBadges.push(BADGES.find(b => b.id === 'streak_7'));
  }
  if (stats.streaks.current >= 30 && !stats.badges.find(b => b.id === 'streak_30')) {
    newBadges.push(BADGES.find(b => b.id === 'streak_30'));
  }
  if (stats.totalFocusMinutes >= 600 && !stats.badges.find(b => b.id === 'focused_10h')) {
    newBadges.push(BADGES.find(b => b.id === 'focused_10h'));
  }
  if (stats.level >= 10 && !stats.badges.find(b => b.id === 'level_10')) {
    newBadges.push(BADGES.find(b => b.id === 'level_10'));
  }
  if (stats.achievements.perfectDay >= 1 && !stats.badges.find(b => b.id === 'perfect_day')) {
    newBadges.push(BADGES.find(b => b.id === 'perfect_day'));
  }

  newBadges.forEach(badge => {
    if (badge) {
      stats.badges.push({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        earnedAt: new Date()
      });
    }
  });

  return newBadges;
};

module.exports = router;