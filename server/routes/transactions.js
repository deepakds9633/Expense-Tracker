const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Cash = require('../models/Cash');
const BankAccount = require('../models/BankAccount');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all transactions (newest first)
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET recent transactions (last 5)
router.get('/recent', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 }).limit(5);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - add a transaction and auto-update balance
router.post('/', async (req, res) => {
  try {
    const { amount, type, source, accountId, note } = req.body;

    if (!amount || !type || !source) {
      return res.status(400).json({ message: 'amount, type, and source are required' });
    }

    const parsedAmount = parseFloat(amount);
    let accountName = null;

    // Update the correct balance based on source
    if (source === 'coins' || source === 'notes') {
      let cash = await Cash.findOne({ userId: req.user._id });
      if (!cash) cash = await Cash.create({ userId: req.user._id, coins: 0, notes: 0 });

      const field = source; // 'coins' or 'notes'
      if (type === 'expense') {
        if (cash[field] < parsedAmount) {
          return res.status(400).json({ message: `Insufficient ${field} balance` });
        }
        cash[field] -= parsedAmount;
      } else {
        cash[field] += parsedAmount;
      }
      await cash.save();

    } else if (source === 'bank') {
      if (!accountId) return res.status(400).json({ message: 'accountId is required for bank transactions' });

      const account = await BankAccount.findOne({ _id: accountId, userId: req.user._id });
      if (!account) return res.status(404).json({ message: 'Bank account not found' });

      accountName = account.name;

      if (type === 'expense') {
        if (account.balance < parsedAmount) {
          return res.status(400).json({ message: `Insufficient balance in ${account.name}` });
        }
        account.balance -= parsedAmount;
      } else {
        account.balance += parsedAmount;
      }
      await account.save();
    }

    // Save transaction record
    const transaction = await Transaction.create({
      userId: req.user._id,
      amount: parsedAmount,
      type,
      source,
      accountId: source === 'bank' ? accountId : null,
      accountName,
      note: note || '',
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a transaction (does NOT reverse balance — for record cleanup only)
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
