const BaseRepository = require('../../core/repositories/base.repository');
const { Admin } = require('./admin.model');

class AdminRepository extends BaseRepository {
  constructor() {
    super(Admin);
  }

  async findByEmail(email, options = {}) {
    return this.model.findOne({
      where: { email },
      ...options,
    });
  }
}

module.exports = new AdminRepository();
