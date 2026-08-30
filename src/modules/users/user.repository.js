const BaseRepository = require('../../core/repositories/base.repository');
const { User } = require('./user.model');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, options = {}) {
    return this.model.findOne({
      where: { email },
      ...options,
    });
  }
}

module.exports = new UserRepository();
