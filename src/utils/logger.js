const config = require('../config/env');

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  error: (message, meta = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  debug: (message, meta = {}) => {
    if (config.env !== 'production') {
      console.debug(`[DEBUG] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }
  },
};

module.exports = logger;
