'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const adminEmail = 'admin@example.com';
    const existing = await queryInterface.rawSelect('admins', { where: { email: adminEmail } }, ['id']);

    let adminId = existing;
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      await queryInterface.bulkInsert(
        'admins',
        [
          {
            name: 'Super Admin',
            email: adminEmail,
            password: hashedPassword,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]
      );
      adminId = await queryInterface.rawSelect('admins', { where: { email: adminEmail } }, ['id']);
    }

    // Attach super_admin role (id 1) to Admin in admin_roles
    const existingRoleAdmin = await queryInterface.rawSelect('admin_roles', {
      where: { adminId: adminId || 1, roleId: 1 },
    }, ['adminId']);

    if (!existingRoleAdmin) {
      await queryInterface.bulkInsert('admin_roles', [
        {
          adminId: adminId || 1,
          roleId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('admin_roles', null, {});
    await queryInterface.bulkDelete('admins', { email: 'admin@example.com' }, {});
  },
};
