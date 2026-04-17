const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me  (verify token + get profile)
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
});

module.exports = router;
