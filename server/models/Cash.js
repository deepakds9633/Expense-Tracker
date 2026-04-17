const mongoose = require('mongoose');

const cashSchema = new mongoose.Schema({
  coins: { type: Number, default: 0 },
  notes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cash', cashSchema);
