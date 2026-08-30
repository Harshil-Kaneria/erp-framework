const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('./file.controller');
const authenticateAdmin = require('../../middleware/authenticate-admin');
const authorize = require('../../middleware/authorize');
const uploadConfig = require('../../config/upload');

// Memory storage multer for direct service routing
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: uploadConfig.maxSizeBytes },
});

router.post('/upload', authenticateAdmin, authorize(['file.upload']), memoryUpload.single('file'), fileController.upload);
router.post('/presign', authenticateAdmin, authorize(['file.upload']), fileController.presign);

module.exports = router;
