const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { date, tasks } = req.body;
    const userId = req.user.id;

    const taskDocs = tasks.map(task => ({
      userId,
      date,
      timeSlot: task.timeSlot,
      taskName: task.taskName,
      status: task.status || 'not_started',
      note: task.note || ''
    }));

    await Task.deleteMany({ userId, date });
    
    const newTasks = await Task.insertMany(taskDocs);
    
    res.json(newTasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    const dbTasks = await Task.find({ userId, date }).sort({ timeSlot: 1 });
    const user = await User.findById(userId);

    if (!user.defaultRoutine || user.defaultRoutine.length === 0) {
      return res.json(dbTasks);
    }

    const taskMap = {};
    dbTasks.forEach(t => { taskMap[t.timeSlot] = t; });

    const merged = user.defaultRoutine.map(rt => {
      if (taskMap[rt.timeSlot]) {
        return taskMap[rt.timeSlot];
      }
      return {
        _id: null,
        userId,
        date,
        timeSlot: rt.timeSlot,
        taskName: rt.taskName,
        status: 'not_started',
        note: '',
        isFromTemplate: true
      };
    });

    const mergedSlots = new Set(merged.map(m => m.timeSlot));
    dbTasks.forEach(t => {
      if (!mergedSlots.has(t.timeSlot)) {
        merged.push(t);
        mergedSlots.add(t.timeSlot);
      }
    });

    res.json(merged);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { date, timeSlot, taskName, status, note } = req.body;
    const updateData = {};
    
    if (status) updateData.status = status;
    if (note !== undefined) updateData.note = note;
    if (taskName) updateData.taskName = taskName;
    if (timeSlot) updateData.timeSlot = timeSlot;

    let task = await Task.findById(req.params.id);

    if (!task) {
      if (date && timeSlot && taskName) {
        const newTask = new Task({
          userId: req.user.id,
          date,
          timeSlot,
          taskName,
          status: status || 'not_started',
          note: note || ''
        });
        await newTask.save();
        return res.json(newTask);
      }
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/update-or-create', auth, async (req, res) => {
  try {
    const { date, timeSlot, taskName, status } = req.body;
    const userId = req.user.id;

    let task = await Task.findOne({ userId, date, timeSlot });

    if (task) {
      task.status = status;
      if (taskName) task.taskName = taskName;
      await task.save();
      return res.json(task);
    }

    const newTask = new Task({
      userId,
      date,
      timeSlot,
      taskName,
      status: status || 'not_started'
    });
    await newTask.save();
    res.json(newTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/single', auth, async (req, res) => {
  try {
    const { date, timeSlot, taskName, note } = req.body;
    const userId = req.user.id;

    if (!date || !timeSlot || !taskName) {
      return res.status(400).json({ msg: 'date, timeSlot, and taskName are required' });
    }

    const task = new Task({
      userId,
      date,
      timeSlot,
      taskName,
      status: 'not_started',
      note: note || ''
    });

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/update', auth, async (req, res) => {
  try {
    const { _id, date, timeSlot, taskName } = req.body;

    if (_id) {
      const task = await Task.findById(_id);
      if (!task) return res.status(404).json({ msg: 'Task not found' });
      if (task.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

      if (taskName) task.taskName = taskName;
      if (timeSlot) task.timeSlot = timeSlot;
      task.updatedAt = Date.now();
      await task.save();
      return res.json(task);
    }

    if (date && timeSlot && taskName) {
      let task = await Task.findOne({ userId: req.user.id, date, timeSlot });
      if (task) {
        task.taskName = taskName;
        task.updatedAt = Date.now();
        await task.save();
        return res.json(task);
      }
    }

    return res.status(404).json({ msg: 'Task not found' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/bulk', auth, async (req, res) => {
  try {
    const { tasks } = req.body;
    const userId = req.user.id;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ msg: 'Tasks array is required' });
    }

    const taskDocs = tasks.map(task => ({
      userId,
      date: task.date,
      timeSlot: task.timeSlot,
      taskName: task.taskName,
      status: task.status || 'not_started',
      note: task.note || ''
    }));

    await Task.insertMany(taskDocs);
    
    res.json({ msg: 'Tasks created successfully', count: taskDocs.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;