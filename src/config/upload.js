const path = require('path');
const config = require('./env');

const uploadDirAbsolute = path.isAbsolute(config.storage.uploadDir)
  ? config.storage.uploadDir
  : path.resolve(process.cwd(), config.storage.uploadDir);

module.exports = {
  uploadDir: uploadDirAbsolute,
  maxSizeBytes: config.storage.maxSizeBytes,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
};
