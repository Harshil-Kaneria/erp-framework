const Joi = require('joi');

const create = {
  body: Joi.object({
    name: Joi.string().max(100).required(),
    email: Joi.string().email().max(150).required(),
    password: Joi.string().min(8).required(),
    isActive: Joi.boolean().default(true),
  }),
};

const update = {
  body: Joi.object({
    name: Joi.string().max(100),
    email: Joi.string().email().max(150),
    isActive: Joi.boolean(),
  }),
};

module.exports = {
  create,
  update,
};
