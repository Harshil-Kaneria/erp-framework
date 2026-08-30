const CrudService = require('./crud.service');

class CrudController {
  constructor(crudConfig) {
    this.config = crudConfig;
    this.service = new CrudService(crudConfig);
  }

  list = async (req, res, next) => {
    try {
      const data = await this.service.list(req.query);
      return res.jsonbash.success(data, `${this.config.resource} list retrieved successfully`);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const data = await this.service.getById(req.params.id);
      return res.jsonbash.success(data, `${this.config.resource} retrieved successfully`);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = await this.service.create(req.body);
      return res.jsonbash.success(data, `${this.config.resource} created successfully`, 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.service.update(req.params.id, req.body);
      return res.jsonbash.success(data, `${this.config.resource} updated successfully`);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.service.delete(req.params.id);
      return res.jsonbash.success(null, `${this.config.resource} deleted successfully`);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = CrudController;
