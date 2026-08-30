'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      resource: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      resourceId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      ip: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('audit_logs', ['adminId'], { name: 'idx_audit_admin_id' });
    await queryInterface.addIndex('audit_logs', ['action'], { name: 'idx_audit_action' });
    await queryInterface.addIndex('audit_logs', ['resource', 'resourceId'], { name: 'idx_audit_resource' });
    await queryInterface.addIndex('audit_logs', ['createdAt'], { name: 'idx_audit_created_at' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};
