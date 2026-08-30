const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uploadConfig = require('../config/upload');
const AppError = require('../core/errors/app-error');
const ErrorCodes = require('../core/errors/error-codes');

// Ensure upload directory exists locally
if (!fs.existsSync(uploadConfig.uploadDir)) {
  fs.mkdirSync(uploadConfig.uploadDir, { recursive: true });
}

// Multer Disk Storage Engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} is not allowed`, 400, ErrorCodes.FILE_TYPE_NOT_ALLOWED), false);
  }
};

/**
 * Multer upload middleware configured for local storage
 */
const localMulter = multer({
  storage,
  limits: { fileSize: uploadConfig.maxSizeBytes },
  fileFilter,
});

/**
 * Save raw Buffer to local uploads directory
 */
async function saveLocalFileBuffer(buffer, originalName, mimeType) {
  if (uploadConfig.allowedMimeTypes.length && !uploadConfig.allowedMimeTypes.includes(mimeType)) {
    throw new AppError(`File type ${mimeType} is not allowed`, 400, ErrorCodes.FILE_TYPE_NOT_ALLOWED);
  }

  const ext = path.extname(originalName);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const sanitizedBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${sanitizedBase}-${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadConfig.uploadDir, filename);

  await fs.promises.writeFile(filePath, buffer);

  return {
    filename,
    filePath,
    url: `/uploads/${filename}`,
    mimeType,
    size: buffer.length,
    storageDriver: 'local',
  };
}

/**
 * Delete file from local uploads directory
 */
async function deleteLocalFile(filename) {
  const filePath = path.join(uploadConfig.uploadDir, filename);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
    return true;
  }
  return false;
}

module.exports = {
  localMulter,
  saveLocalFileBuffer,
  deleteLocalFile,
};
