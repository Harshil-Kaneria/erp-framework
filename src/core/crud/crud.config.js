const crudRegistry = new Map();

/**
 * Register a generic CRUD resource with security allowlists and permission definitions
 * example configuration:
 * registerCrud({
 *   resource: 'departments',
 *   model: DepartmentModel,
 *   permissions: { read: 'department.read', create: 'department.create', update: 'department.update', delete: 'department.delete' },
 *   searchable: ['name', 'code'],
 *   filterable: ['status'],
 *   sortable: ['name', 'createdAt'],
 *   selectable: ['id', 'name', 'code', 'status', 'createdAt']
 * })
 */
function registerCrud(config) {
  if (!config || !config.resource || !config.model) {
    throw new Error('CRUD registration requires resource name and Sequelize model');
  }

  const normalizedConfig = {
    resource: config.resource,
    model: config.model,
    permissions: config.permissions || {},
    searchable: Array.isArray(config.searchable) ? config.searchable : [],
    filterable: Array.isArray(config.filterable) ? config.filterable : [],
    sortable: Array.isArray(config.sortable) ? config.sortable : [],
    selectable: Array.isArray(config.selectable) ? config.selectable : [],
    defaultSort: config.defaultSort || [['createdAt', 'DESC']],
    cursorField: config.cursorField || 'id',
  };

  crudRegistry.set(config.resource, normalizedConfig);
  return normalizedConfig;
}

function getCrudConfig(resource) {
  return crudRegistry.get(resource);
}

module.exports = {
  registerCrud,
  getCrudConfig,
  crudRegistry,
};
