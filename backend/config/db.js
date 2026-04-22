// GITHUB: Day 2 - Commit 1 - "feat(backend): add Express server setup, MongoDB connection, and middleware"

const mongoose = require('mongoose');
const dns = require('dns');

// Use Google public DNS for SRV lookups — the local DNS proxy at 127.0.0.1
// (set by VPN/antivirus) does not resolve MongoDB Atlas SRV records.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
