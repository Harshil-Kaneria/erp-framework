const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const userValidation = require('./user.validation');
const authenticateAdmin = require('../../middleware/authenticate-admin');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');

router.get('/', authenticateAdmin, authorize(['user.read']), userController.list);
router.get('/:id', authenticateAdmin, authorize(['user.read']), userController.getById);
router.post('/', authenticateAdmin, authorize(['user.create']), validate(userValidation.create), userController.create);
router.patch('/:id', authenticateAdmin, authorize(['user.update']), validate(userValidation.update), userController.update);
router.delete('/:id', authenticateAdmin, authorize(['user.delete']), userController.delete);

module.exports = router;
