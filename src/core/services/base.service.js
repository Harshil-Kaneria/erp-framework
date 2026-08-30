const AppError = require('../errors/app-error');
const ErrorCodes = require('../errors/error-codes');

class BaseService {
  constructor(repository) {
    if (!repository) {
      throw new Error('BaseService requires a valid repository instance');
    }
    this.repository = repository;
  }

  async getAll(options = {}) {
    return this.repository.findAll(options);
  }

  async getById(id, options = {}) {
    const entity = await this.repository.findById(id, options);
    if (!entity) {
      throw new AppError('Resource not found', 404, ErrorCodes.NOT_FOUND);
    }
    return entity;
  }

  async create(data, options = {}) {
    return this.repository.create(data, options);
  }

  async update(id, data, options = {}) {
    await this.getById(id, options); // Ensure exists
    await this.repository.update(id, data, options);
    return this.getById(id, options);
  }

  async delete(id, options = {}) {
    await this.getById(id, options); // Ensure exists
    return this.repository.delete(id, options);
  }

  async listPaginated(queryParams = {}, sequelizeOptions = {}, useCursor = false, cursorField = 'id') {
    if (useCursor || queryParams.cursor) {
      return this.repository.findAndPaginateCursor(queryParams, sequelizeOptions, cursorField);
    }
    return this.repository.findAndPaginateOffset(queryParams, sequelizeOptions);
  }
}

module.exports = BaseService;
