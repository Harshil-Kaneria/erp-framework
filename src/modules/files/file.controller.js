const fileService = require('./file.service');
const AppError = require('../../core/errors/app-error');
const ErrorCodes = require('../../core/errors/error-codes');

class FileController {
  /**
   * Handle File Upload endpoint (Local disk or S3 depending on query/driver parameter)
   */
  upload = async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError('No file attached in request body', 400, ErrorCodes.BAD_REQUEST);
      }

      const driver = req.query.driver || undefined;
      const result = await fileService.uploadFile(
        req.file.buffer || req.file.path,
        req.file.originalname,
        req.file.mimetype,
        driver
      );

      return res.jsonbash.success(result, 'File uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle S3 Presigned URL Request endpoint
   */
  presign = async (req, res, next) => {
    try {
      const { fileName, fileType } = req.body;
      if (!fileName || !fileType) {
        throw new AppError('fileName and fileType are required', 400, ErrorCodes.BAD_REQUEST);
      }

      const result = await fileService.getS3PresignedUrl(fileName, fileType);
      return res.jsonbash.success(result, 'Presigned URL generated successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new FileController();
