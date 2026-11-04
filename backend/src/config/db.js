const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to ensure Atlas SRV resolution works across Windows & local ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Use system default if setServers is restricted
}

let gridfsBucket = null;

const connectDB = async (retries = 5) => {
  // Reuse existing connection in serverless (e.g. Vercel) environments
  if (mongoose.connection.readyState >= 1) {
    if (!gridfsBucket && mongoose.connection.db) {
      gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
      });
    }
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/make_my_marriage';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Connecting to MongoDB Atlas (Attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);

      // Initialize GridFS Bucket for media storage
      gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
        bucketName: 'uploads'
      });
      console.log('GridFS Bucket initialized for uploads');

      return conn;
    } catch (error) {
      console.error(`Database Connection Attempt ${attempt} Failed: ${error.message}`);
      if (attempt < retries) {
        console.log('Retrying in 2 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        console.error('All database connection attempts exhausted.');
        process.exit(1);
      }
    }
  }
};

const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error('GridFS bucket has not been initialized. Ensure connectDB has completed.');
  }
  return gridfsBucket;
};

module.exports = {
  connectDB,
  getGridFSBucket
};

