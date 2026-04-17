const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['expense', 'income'], required: true },
  source: { type: String, enum: ['coins', 'notes', 'bank'], required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', default: null },
  accountName: { type: String, default: null },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
