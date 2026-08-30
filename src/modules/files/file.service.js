const { saveLocalFileBuffer, deleteLocalFile } = require('../../utils/local-upload');
const { uploadToS3, generateS3PresignedUploadUrl } = require('../../utils/s3-upload');
const config = require('../../config/env');
const AppError = require('../../core/errors/app-error');

class FileService {
  /**
   * Upload file using configured or specified storage driver ('local' or 's3')
   */
  async uploadFile(fileBuffer, originalName, mimeType, driver = config.storage.driver) {
    if (driver === 's3') {
      const key = `uploads/${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      return uploadToS3({ buffer: fileBuffer, key, contentType: mimeType });
    }

    // Default to local upload strategy
    return saveLocalFileBuffer(fileBuffer, originalName, mimeType);
  }

  /**
   * Request an S3 presigned URL for direct client-side upload
   */
  async getS3PresignedUrl(originalName, mimeType, expiresIn = 900) {
    const key = `uploads/presigned-${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    return generateS3PresignedUploadUrl({ key, contentType: mimeType, expiresIn });
  }
}

module.exports = new FileService();
