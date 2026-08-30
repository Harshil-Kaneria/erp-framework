'use strict';

module.exports = {
  async up(queryInterface) {
    const roles = [
      { id: 1, name: 'super_admin', description: 'Super Administrator with full access', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'admin', description: 'Administrator', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'manager', description: 'Department Manager', createdAt: new Date(), updatedAt: new Date() },
    ];

    for (const role of roles) {
      const existing = await queryInterface.rawSelect('roles', { where: { name: role.name } }, ['id']);
      if (!existing) {
        await queryInterface.bulkInsert('roles', [role]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
