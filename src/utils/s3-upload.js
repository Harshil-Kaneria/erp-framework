const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, bucketName } = require('../config/aws');
const AppError = require('../core/errors/app-error');
const ErrorCodes = require('../core/errors/error-codes');

/**
 * Upload a file Buffer directly to S3
 */
async function uploadToS3({ buffer, key, contentType }) {
  if (!s3Client) {
    throw new AppError('AWS S3 client is not configured', 500, ErrorCodes.FILE_UPLOAD_FAILED);
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return {
      key,
      bucket: bucketName,
      location: `https://${bucketName}.s3.amazonaws.com/${key}`,
      storageDriver: 's3',
    };
  } catch (error) {
    throw new AppError(`S3 upload failed: ${error.message}`, 500, ErrorCodes.FILE_UPLOAD_FAILED);
  }
}

/**
 * Generate a Presigned URL for direct client-side S3 upload
 */
async function generateS3PresignedUploadUrl({ key, contentType, expiresIn = 900 }) {
  if (!s3Client) {
    throw new AppError('AWS S3 client is not configured', 500, ErrorCodes.FILE_UPLOAD_FAILED);
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      presignedUrl,
      key,
      bucket: bucketName,
      expiresIn,
      fileUrl: `https://${bucketName}.s3.amazonaws.com/${key}`,
    };
  } catch (error) {
    throw new AppError(`Failed to generate S3 presigned URL: ${error.message}`, 500, ErrorCodes.FILE_UPLOAD_FAILED);
  }
}

/**
 * Generate a Presigned URL for viewing/downloading an S3 file
 */
async function generateS3PresignedDownloadUrl({ key, expiresIn = 3600 }) {
  if (!s3Client) {
    throw new AppError('AWS S3 client is not configured', 500, ErrorCodes.FILE_UPLOAD_FAILED);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    throw new AppError(`Failed to generate download presigned URL: ${error.message}`, 500, ErrorCodes.FILE_UPLOAD_FAILED);
  }
}

/**
 * Delete an object from S3
 */
async function deleteFromS3(key) {
  if (!s3Client) return false;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  uploadToS3,
  generateS3PresignedUploadUrl,
  generateS3PresignedDownloadUrl,
  deleteFromS3,
};
