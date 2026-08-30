'use strict';

module.exports = {
  async up(queryInterface) {
    const permissions = [
      { id: 1, name: 'admin.read', description: 'Read admin list & details', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'admin.create', description: 'Create new admin accounts', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'admin.update', description: 'Update existing admin accounts', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'admin.delete', description: 'Delete admin accounts', createdAt: new Date(), updatedAt: new Date() },
      
      { id: 5, name: 'user.read', description: 'Read regular user list & details', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'user.create', description: 'Create regular users', createdAt: new Date(), updatedAt: new Date() },
      { id: 7, name: 'user.update', description: 'Update regular users', createdAt: new Date(), updatedAt: new Date() },
      { id: 8, name: 'user.delete', description: 'Delete regular users', createdAt: new Date(), updatedAt: new Date() },

      { id: 9, name: 'role.read', description: 'Read roles & permissions', createdAt: new Date(), updatedAt: new Date() },
      { id: 10, name: 'role.create', description: 'Create new role', createdAt: new Date(), updatedAt: new Date() },
      { id: 11, name: 'role.update', description: 'Update existing role', createdAt: new Date(), updatedAt: new Date() },
      { id: 12, name: 'role.delete', description: 'Delete role', createdAt: new Date(), updatedAt: new Date() },

      { id: 13, name: 'file.upload', description: 'Upload files', createdAt: new Date(), updatedAt: new Date() },
    ];

    for (const perm of permissions) {
      const existing = await queryInterface.rawSelect('permissions', { where: { name: perm.name } }, ['id']);
      if (!existing) {
        await queryInterface.bulkInsert('permissions', [perm]);
      }
    }

    // Assign super_admin role (id 1) all permissions in role_permissions
    for (const perm of permissions) {
      const existingMapping = await queryInterface.rawSelect('role_permissions', {
        where: { roleId: 1, permissionId: perm.id },
      }, ['roleId']);
      if (!existingMapping) {
        await queryInterface.bulkInsert('role_permissions', [{
          roleId: 1,
          permissionId: perm.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
  },
};
