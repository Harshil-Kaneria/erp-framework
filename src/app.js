const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jsonbash = require('jsonbash');
const config = require('./config/env');
const uploadConfig = require('./config/upload');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/not-found');
const errorHandler = require('./middleware/error-handler');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JsonBash Middleware Initialization
app.use(jsonbash.middleware());

// Serve uploaded files statically
app.use('/uploads', express.static(uploadConfig.uploadDir));

// System Health Check Endpoint using JsonBash
app.get('/health', (req, res) => {
  return res.jsonbash.success(
    {
      environment: config.env,
      timestamp: new Date().toISOString(),
    },
    'System health operational'
  );
});

// Register Main API Routes
app.use('/api', apiRoutes);

// 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
