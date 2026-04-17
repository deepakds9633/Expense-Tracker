const express = require('express');
const router = express.Router();
const BankAccount = require('../models/BankAccount');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all bank accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - add a new bank account
router.post('/', async (req, res) => {
  try {
    const { name, balance, color } = req.body;
    const account = await BankAccount.create({ userId: req.user._id, name, balance: balance || 0, color: color || '#6366f1' });
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - update a bank account balance or name
router.put('/:id', async (req, res) => {
  try {
    const { name, balance, color } = req.body;
    const account = await BankAccount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...(name !== undefined && { name }), ...(balance !== undefined && { balance }), ...(color !== undefined && { color }) },
      { new: true }
    );
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - remove a bank account
router.delete('/:id', async (req, res) => {
  try {
    await BankAccount.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
