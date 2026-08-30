const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authValidation = require('./auth.validation');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');

router.post('/login', validate(authValidation.login), authController.login);
router.post('/refresh', validate(authValidation.refresh), authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, validate(authValidation.changePassword), authController.changePassword);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

module.exports = router;
