const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const adminValidation = require('./admin.validation');
const authenticateAdmin = require('../../middleware/authenticate-admin');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');

router.get('/', authenticateAdmin, authorize(['admin.read']), adminController.list);
router.get('/:id', authenticateAdmin, authorize(['admin.read']), adminController.getById);
router.post('/', authenticateAdmin, authorize(['admin.create']), validate(adminValidation.create), adminController.create);
router.patch('/:id', authenticateAdmin, authorize(['admin.update']), validate(adminValidation.update), adminController.update);
router.delete('/:id', authenticateAdmin, authorize(['admin.delete']), adminController.delete);

module.exports = router;
