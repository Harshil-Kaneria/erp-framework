const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file for local development
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || (process.env.DB_DIALECT === 'mysql' ? 3306 : 5432),
    name: process.env.DB_NAME || 'erp_db',
    user: process.env.DB_USER || (process.env.DB_DIALECT === 'mysql' ? 'root' : 'postgres'),
    pass: process.env.DB_PASS !== undefined ? process.env.DB_PASS : '',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-access-jwt-secret-default-change-in-prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-jwt-secret-default-change-in-prod',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxSizeBytes: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024,
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.AWS_S3_BUCKET || 'erp-app-file-uploads',
  },
};
