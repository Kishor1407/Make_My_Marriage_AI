const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

// Create GridFS Storage engine for Multer
const storage = new GridFsStorage({
  url: process.env.MONGO_URI || 'mongodb://localhost:27017/make_my_marriage',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve) => {
      const fileInfo = {
        filename: `${Date.now()}-${file.originalname}`,
        bucketName: 'uploads',
        metadata: {
          marriageId: req.body.marriageId || null,
          eventId: req.params.eventId || req.body.eventId || null,
          mediaType: req.body.mediaType || 'PHOTO',
          uploaderName: req.body.uploaderName || 'Anonymous Guest',
          uploaderEmail: req.body.uploaderEmail || 'guest@makemymarriage.local',
          uploaderRole: req.user ? req.user.role : 'GUEST'
        }
      };
      resolve(fileInfo);
    });
  }
});

// Enforce max 10 files per request to prevent server timeouts and free-tier crashes
const uploadBatch = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 15 * 1024 * 1024 // 15MB limit per file
  }
}).array('files', 10);

module.exports = {
  uploadBatch
};

