const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'يرجى إدخال اسم المستخدم وكلمة المرور.' });
    const user = await User.findOne({ username });
    if (!user || !user.active) return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم.' });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// Get all users (admin only)
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم.' });
  }
});

// Create user (admin only)
router.post('/users', auth, adminOnly, async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'اسم المستخدم موجود مسبقاً.' });
    const user = new User({ username, password, name, role: role || 'user' });
    await user.save();
    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح.' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم.' });
  }
});

// Update user (admin only)
router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, role, active, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود.' });
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof active !== 'undefined') user.active = active;
    if (password) user.password = password;
    await user.save();
    res.json({ message: 'تم التحديث بنجاح.' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم.' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص.' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف المستخدم.' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم.' });
  }
});

module.exports = router;
