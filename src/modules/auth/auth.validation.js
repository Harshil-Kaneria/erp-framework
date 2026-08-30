const Joi = require('joi');

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

const forgotPassword = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),
};

module.exports = {
  login,
  refresh,
  changePassword,
  forgotPassword,
  resetPassword,
};
