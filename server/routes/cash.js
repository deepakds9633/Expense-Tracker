const express = require('express');
const router = express.Router();
const Cash = require('../models/Cash');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET cash balances (coins + notes)
router.get('/', async (req, res) => {
  try {
    let cash = await Cash.findOne({ userId: req.user._id });
    if (!cash) {
      // Create default cash record if none exists
      cash = await Cash.create({ userId: req.user._id, coins: 0, notes: 0 });
    }
    res.json(cash);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - update coins and/or notes
router.put('/', async (req, res) => {
  try {
    const { coins, notes } = req.body;
    let cash = await Cash.findOne({ userId: req.user._id });
    if (!cash) {
      cash = new Cash({ userId: req.user._id, coins: 0, notes: 0 });
    }
    if (coins !== undefined) cash.coins = coins;
    if (notes !== undefined) cash.notes = notes;
    await cash.save();
    res.json(cash);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
