const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
  color: { type: String, default: '#6366f1' },
}, { timestamps: true });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
