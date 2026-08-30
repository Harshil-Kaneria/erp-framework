const { Op } = require('sequelize');
const {
  parseOffsetPaginationParams,
  formatOffsetPaginationResult,
  parseCursorPaginationParams,
  formatCursorPaginationResult,
} = require('../../utils/pagination');

class BaseRepository {
  constructor(model) {
    if (!model) {
      throw new Error('BaseRepository requires a valid Sequelize model');
    }
    this.model = model;
  }

  /**
   * Find all records with optional query parameters/associations
   */
  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  /**
   * Find record by primary key
   */
  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  /**
   * Find single record matching conditions
   */
  async findOne(options = {}) {
    return this.model.findOne(options);
  }

  /**
   * Create a new record
   */
  async create(data, options = {}) {
    return this.model.create(data, options);
  }

  /**
   * Bulk create records
   */
  async bulkCreate(records, options = {}) {
    return this.model.bulkCreate(records, options);
  }

  /**
   * Update records matching primary key or options condition
   */
  async update(idOrWhere, data, options = {}) {
    let whereClause;
    if (typeof idOrWhere === 'object' && idOrWhere !== null) {
      whereClause = idOrWhere;
    } else {
      whereClause = { id: idOrWhere };
    }

    const [affectedCount, updatedRows] = await this.model.update(data, {
      where: whereClause,
      returning: true,
      ...options,
    });

    return { affectedCount, updatedRows };
  }

  /**
   * Delete records matching primary key or options condition
   */
  async delete(idOrWhere, options = {}) {
    let whereClause;
    if (typeof idOrWhere === 'object' && idOrWhere !== null) {
      whereClause = idOrWhere;
    } else {
      whereClause = { id: idOrWhere };
    }

    return this.model.destroy({
      where: whereClause,
      ...options,
    });
  }

  /**
   * Count records matching options condition
   */
  async count(options = {}) {
    return this.model.count(options);
  }

  /**
   * Offset-based Paginated List Query
   */
  async findAndPaginateOffset(queryParams = {}, sequelizeOptions = {}) {
    const { page, limit, offset } = parseOffsetPaginationParams(queryParams);

    const options = {
      ...sequelizeOptions,
      limit,
      offset,
      distinct: true,
    };

    const { rows, count } = await this.model.findAndCountAll(options);

    return formatOffsetPaginationResult(rows, count, page, limit);
  }

  /**
   * Cursor-based Paginated List Query (High Performance for large tables)
   * cursorField: column name to order and slice by (e.g. 'id' or 'createdAt')
   */
  async findAndPaginateCursor(queryParams = {}, sequelizeOptions = {}, cursorField = 'id') {
    const { limit, cursor } = parseCursorPaginationParams(queryParams);

    const baseWhere = sequelizeOptions.where || {};
    let cursorWhere = {};

    if (cursor && cursor[cursorField] !== undefined) {
      // Default to ascending order (Op.gt). If order is DESC, use Op.lt.
      const sortOrder = (sequelizeOptions.order && sequelizeOptions.order[0] && sequelizeOptions.order[0][1]) || 'ASC';
      const operator = sortOrder.toUpperCase() === 'DESC' ? Op.lt : Op.gt;
      cursorWhere = { [cursorField]: { [operator]: cursor[cursorField] } };
    }

    const mergedWhere = Object.keys(cursorWhere).length
      ? { [Op.and]: [baseWhere, cursorWhere] }
      : baseWhere;

    const options = {
      ...sequelizeOptions,
      where: mergedWhere,
      limit: limit + 1, // Fetch +1 to check for next page
      order: sequelizeOptions.order || [[cursorField, 'ASC']],
    };

    const rows = await this.model.findAll(options);

    return formatCursorPaginationResult(rows, limit, [cursorField]);
  }
}

module.exports = BaseRepository;
