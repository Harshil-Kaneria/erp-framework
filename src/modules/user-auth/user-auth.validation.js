const Joi = require('joi');

const register = {
  body: Joi.object({
    name: Joi.string().max(100).required(),
    email: Joi.string().email().max(150).required(),
    phone: Joi.string().max(50).optional(),
    password: Joi.string().min(8).required(),
  }),
};

const login = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const refresh = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

const changePassword = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),
};

module.exports = {
  register,
  login,
  refresh,
  changePassword,
};
