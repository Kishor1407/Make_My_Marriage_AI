const mongoose = require('mongoose');

let gridfsBucket = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/make_my_marriage');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS Bucket for media storage
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'uploads'
    });
    console.log('GridFS Bucket initialized for uploads');

    return conn;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
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

