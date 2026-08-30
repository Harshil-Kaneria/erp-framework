'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const userEmail = 'user@example.com';
    const existing = await queryInterface.rawSelect('users', { where: { email: userEmail } }, ['id']);

    if (!existing) {
      const hashedPassword = await bcrypt.hash('User@123456', 10);
      await queryInterface.bulkInsert(
        'users',
        [
          {
            name: 'Standard User',
            email: userEmail,
            phone: '+1234567890',
            password: hashedPassword,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'user@example.com' }, {});
  },
};
