const express = require('express');
const router = express.Router();
const userAuthController = require('./user-auth.controller');
const userAuthValidation = require('./user-auth.validation');
const authenticateUser = require('../../middleware/authenticate-user');
const validate = require('../../middleware/validate');

router.post('/register', validate(userAuthValidation.register), userAuthController.register);
router.post('/login', validate(userAuthValidation.login), userAuthController.login);
router.post('/refresh', validate(userAuthValidation.refresh), userAuthController.refresh);
router.post('/logout', authenticateUser, userAuthController.logout);
router.get('/me', authenticateUser, userAuthController.getMe);
router.post('/change-password', authenticateUser, validate(userAuthValidation.changePassword), userAuthController.changePassword);

module.exports = router;
