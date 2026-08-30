const BaseService = require('../services/base.service');
const BaseRepository = require('../repositories/base.repository');
const { buildQueryOptions } = require('./crud.query-builder');
const AppError = require('../errors/app-error');
const ErrorCodes = require('../errors/error-codes');

class CrudService extends BaseService {
  constructor(crudConfig) {
    const repository = new BaseRepository(crudConfig.model);
    super(repository);
    this.config = crudConfig;
  }

  async list(queryParams = {}) {
    const sequelizeOptions = buildQueryOptions(queryParams, this.config);
    const useCursor = Boolean(queryParams.cursor);
    return this.listPaginated(queryParams, sequelizeOptions, useCursor, this.config.cursorField || 'id');
  }

  async getById(id) {
    const sequelizeOptions = buildQueryOptions({}, this.config);
    const entity = await this.repository.findById(id, { attributes: sequelizeOptions.attributes });
    if (!entity) {
      throw new AppError(`${this.config.resource} not found`, 404, ErrorCodes.NOT_FOUND);
    }
    return entity;
  }
}

module.exports = CrudService;
