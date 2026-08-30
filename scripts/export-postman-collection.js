const fs = require('fs');
const path = require('path');
const config = require('../src/config/env');

console.log('🚀 Generating Postman Collection for ERP Backend API...');

const postmanCollection = {
  info: {
    name: 'ERP Backend API Collection',
    description: 'Auto-generated Postman Collection with separate Admin Auth (RBAC) and User Auth endpoints.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: `http://localhost:${config.port}/api/v1`, type: 'string' },
    { key: 'adminToken', value: '', type: 'string' },
    { key: 'userToken', value: '', type: 'string' },
  ],
  item: [
    {
      name: 'Health Check',
      request: {
        method: 'GET',
        url: { raw: 'http://localhost:' + config.port + '/health', protocol: 'http', host: ['localhost'], port: String(config.port), path: ['health'] },
      },
    },
    {
      name: 'Admin Portal',
      item: [
        {
          name: 'Admin Auth',
          item: [
            {
              name: 'Admin Login',
              request: {
                method: 'POST',
                header: [{ key: 'Content-Type', value: 'application/json' }],
                body: { mode: 'raw', raw: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123456' }, null, 2) },
                url: { raw: '{{baseUrl}}/admin/auth/login', host: ['{{baseUrl}}'], path: ['admin', 'auth', 'login'] },
              },
            },
            {
              name: 'Admin Me',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{adminToken}}' }],
                url: { raw: '{{baseUrl}}/admin/auth/me', host: ['{{baseUrl}}'], path: ['admin', 'auth', 'me'] },
              },
            },
          ],
        },
        {
          name: 'Admin Management',
          item: [
            {
              name: 'List Admins',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{adminToken}}' }],
                url: { raw: '{{baseUrl}}/admin/admins', host: ['{{baseUrl}}'], path: ['admin', 'admins'] },
              },
            },
          ],
        },
        {
          name: 'User Management (Admin)',
          item: [
            {
              name: 'List Standard Users',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{adminToken}}' }],
                url: { raw: '{{baseUrl}}/admin/users', host: ['{{baseUrl}}'], path: ['admin', 'users'] },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'User Portal',
      item: [
        {
          name: 'User Register',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'John Doe', email: 'john@example.com', password: 'Password@123' }, null, 2) },
            url: { raw: '{{baseUrl}}/user/auth/register', host: ['{{baseUrl}}'], path: ['user', 'auth', 'register'] },
          },
        },
        {
          name: 'User Login',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ email: 'user@example.com', password: 'User@123456' }, null, 2) },
            url: { raw: '{{baseUrl}}/user/auth/login', host: ['{{baseUrl}}'], path: ['user', 'auth', 'login'] },
          },
        },
        {
          name: 'User Me',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{userToken}}' }],
            url: { raw: '{{baseUrl}}/user/auth/me', host: ['{{baseUrl}}'], path: ['user', 'auth', 'me'] },
          },
        },
      ],
    },
  ],
};

const outputPath = path.resolve(process.cwd(), 'postman_collection.json');
fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2), 'utf8');

console.log(`✨ Postman Collection generated successfully at: ${outputPath}`);
