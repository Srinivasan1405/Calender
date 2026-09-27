const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      defaultRoutine: [
        { timeSlot: '05:30', taskName: 'WAKE UP AT 5.30' },
        { timeSlot: '06:00', taskName: 'DON\'T USE MOBILE ON MORNING' },
        { timeSlot: '06:30', taskName: '30 PUSH UPS' },
        { timeSlot: '07:00', taskName: 'TYPING 20 MIN' },
        { timeSlot: '08:00', taskName: 'READ BOOK' },
        { timeSlot: '09:00', taskName: 'PROGRAMMING LANGUAGE' },
        { timeSlot: '10:00', taskName: 'LEARN CODE' },
        { timeSlot: '11:00', taskName: 'SSC TOPICS COVER 1' },
        { timeSlot: '12:00', taskName: 'LEARN NEW THINGS' },
        { timeSlot: '14:00', taskName: 'DRIVING CLASS' },
        { timeSlot: '18:00', taskName: 'INSTA LESS THAN 2 HRS' },
        { timeSlot: '20:00', taskName: 'Review Day' },
        { timeSlot: '21:00', taskName: 'Prepare for Sleep' },
        { timeSlot: '22:00', taskName: 'Sleep' }
      ]
    });

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            defaultRoutine: user.defaultRoutine
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            defaultRoutine: user.defaultRoutine
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/default-routine', auth, async (req, res) => {
  try {
    const { defaultRoutine } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { defaultRoutine },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;