const multer = require('multer');

// Memory storage: buffers incoming compressed files in RAM (<5MB total batch)
// and pipes directly into MongoDB Atlas GridFS via Mongoose connection
const storage = multer.memoryStorage();

// Enforce max 10 files per request to prevent server timeouts and free-tier crashes
// Supports any field name (e.g. 'files' or 'photos')
const uploadBatch = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 15 * 1024 * 1024 // 15MB limit per file
  }
}).any();

module.exports = {
  uploadBatch
};

