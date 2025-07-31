const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/linktree'
};