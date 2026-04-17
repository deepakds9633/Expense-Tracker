const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/cash',         require('./routes/cash'));
app.use('/api/accounts',     require('./routes/accounts'));
app.use('/api/transactions', require('./routes/transactions'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running 🚀' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
