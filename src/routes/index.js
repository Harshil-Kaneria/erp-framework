const express = require('express');
const router = express.Router();

const adminAuthRoutes = require('../modules/admin-auth/admin-auth.routes');
const adminRoutes = require('../modules/admins/admin.routes');
const userManagementRoutes = require('../modules/users/user.routes');
const fileRoutes = require('../modules/files/file.routes');
const userAuthRoutes = require('../modules/user-auth/user-auth.routes');

// Admin Portal API Routes (/api/v1/admin/...)
router.use('/v1/admin/auth', adminAuthRoutes);
router.use('/v1/admin/admins', adminRoutes);
router.use('/v1/admin/users', userManagementRoutes);
router.use('/v1/admin/files', fileRoutes);

// Standard User API Routes (/api/v1/user/...)
router.use('/v1/user/auth', userAuthRoutes);

module.exports = router;
