const express = require('express');
const router = express.Router();
const adminAuthController = require('./admin-auth.controller');
const adminAuthValidation = require('./admin-auth.validation');
const authenticateAdmin = require('../../middleware/authenticate-admin');
const validate = require('../../middleware/validate');

router.post('/login', validate(adminAuthValidation.login), adminAuthController.login);
router.post('/refresh', validate(adminAuthValidation.refresh), adminAuthController.refresh);
router.post('/logout', authenticateAdmin, adminAuthController.logout);
router.get('/me', authenticateAdmin, adminAuthController.getMe);
router.post('/change-password', authenticateAdmin, validate(adminAuthValidation.changePassword), adminAuthController.changePassword);

module.exports = router;
