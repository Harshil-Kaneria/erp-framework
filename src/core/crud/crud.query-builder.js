const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * Build sanitized Sequelize query options strictly matching configured allowlists
 */
function buildQueryOptions(queryParams = {}, config = {}) {
  const whereClauses = [];
  const dialect = sequelize.getDialect ? sequelize.getDialect() : 'postgres';
  const searchOp = dialect === 'postgres' ? Op.iLike : Op.like;

  // 1. Search filter across allowed searchable fields
  if (queryParams.search && config.searchable && config.searchable.length > 0) {
    const searchTerm = `%${queryParams.search.trim()}%`;
    const searchConditions = config.searchable.map((field) => ({
      [field]: { [searchOp]: searchTerm },
    }));
    whereClauses.push({ [Op.or]: searchConditions });
  }

  // 2. Exact match filters across allowed filterable fields
  if (config.filterable && config.filterable.length > 0) {
    for (const field of config.filterable) {
      if (queryParams[field] !== undefined && queryParams[field] !== '') {
        const val = queryParams[field];
        if (typeof val === 'string' && val.includes(',')) {
          whereClauses.push({ [field]: { [Op.in]: val.split(',').map((v) => v.trim()) } });
        } else {
          whereClauses.push({ [field]: val });
        }
      }
    }
  }

  const where = whereClauses.length ? { [Op.and]: whereClauses } : {};

  // 3. Sorting across allowed sortable fields
  let order = config.defaultSort || [['createdAt', 'DESC']];
  if (queryParams.sort && config.sortable && config.sortable.length > 0) {
    const rawSort = String(queryParams.sort);
    const isDesc = rawSort.startsWith('-');
    const field = isDesc ? rawSort.substring(1) : rawSort;

    if (config.sortable.includes(field)) {
      order = [[field, isDesc ? 'DESC' : 'ASC']];
    }
  }

  // 4. Selectable attributes selection
  let attributes = undefined;
  if (queryParams.select && config.selectable && config.selectable.length > 0) {
    const requestedFields = String(queryParams.select).split(',').map((f) => f.trim());
    const validFields = requestedFields.filter((f) => config.selectable.includes(f));
    if (validFields.length > 0) {
      attributes = validFields;
    }
  } else if (config.selectable && config.selectable.length > 0) {
    attributes = config.selectable;
  }

  return { where, order, attributes };
}

module.exports = {
  buildQueryOptions,
};
