// test/dbInit.js
const connectDB = require('../config/database');
require('dotenv').config();

const testConnection = async () => {
  try {
    await connectDB();
    console.log('Database initialization test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit();
  }
};

testConnection();