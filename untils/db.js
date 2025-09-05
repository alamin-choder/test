const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || require('../config.json').MONGO_URI;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected  for short link successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
