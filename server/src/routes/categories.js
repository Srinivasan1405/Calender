const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const DEFAULT_CATEGORIES = [
  { name: 'Health', color: '#10b981', icon: '💪' },
  { name: 'Work', color: '#6366f1', icon: '💼' },
  { name: 'Study', color: '#f59e0b', icon: '📚' },
  { name: 'Personal', color: '#ec4899', icon: '🌱' },
  { name: 'Fitness', color: '#ef4444', icon: '🏃' }
];

router.get('/', auth, async (req, res) => {
  try {
    let categories = await Category.find({ userId: req.user.id });
    
    if (categories.length === 0) {
      categories = await Category.insertMany(
        DEFAULT_CATEGORIES.map(c => ({ ...c, userId: req.user.id }))
      );
    }

    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    
    const category = new Category({
      userId: req.user.id,
      name,
      color: color || '#6366f1',
      icon: icon || '📌'
    });

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, color, icon },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    res.json({ msg: 'Category deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;