const mongoose = require('mongoose');
const { getGridFSBucket } = require('../config/db');

const getMediaReadStream = (fileId) => {
  const bucket = getGridFSBucket();
  const objId = new mongoose.Types.ObjectId(fileId);
  return bucket.openDownloadStream(objId);
};

const deleteMediaFile = async (fileId) => {
  const bucket = getGridFSBucket();
  const objId = new mongoose.Types.ObjectId(fileId);
  return await bucket.delete(objId);
};

module.exports = {
  getMediaReadStream,
  deleteMediaFile
};

