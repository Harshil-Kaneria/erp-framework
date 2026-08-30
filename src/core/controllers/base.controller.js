class BaseController {
  constructor(service) {
    this.service = service;
  }

  list = async (req, res, next) => {
    try {
      const result = await this.service.listPaginated(req.query);
      return res.jsonbash.success(result, 'Resources retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const entity = await this.service.getById(req.params.id);
      return res.jsonbash.success(entity, 'Resource retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const entity = await this.service.create(req.body);
      return res.jsonbash.success(entity, 'Resource created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const entity = await this.service.update(req.params.id, req.body);
      return res.jsonbash.success(entity, 'Resource updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.service.delete(req.params.id);
      return res.jsonbash.success(null, 'Resource deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = BaseController;
