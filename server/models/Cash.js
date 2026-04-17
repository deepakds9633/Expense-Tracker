const mongoose = require('mongoose');

const cashSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coins: { type: Number, default: 0 },
  notes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cash', cashSchema);
