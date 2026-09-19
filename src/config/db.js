const mongoose = require('mongoose');
const config = require('./index');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      autoIndex: config.nodeEnv !== 'production',
    };

    console.log('[MongoDB] Connecting to database...');
    const conn = await mongoose.connect(config.mongodbUri, opts);
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB at ${config.mongodbUri}`);
    console.warn(`[MongoDB] Details: ${error.message}`);
    console.warn('[MongoDB] Running with graceful local fallback until MongoDB is reachable.');
    isConnected = false;
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Disconnected from database.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB] Reconnected to database.');
});

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  isDbConnected
};
