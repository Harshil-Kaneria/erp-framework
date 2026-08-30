const fs = require('fs');
const path = require('path');

const moduleNameArg = process.argv[2];

if (!moduleNameArg) {
  console.error('Error: Please specify a module name.');
  console.log('Usage: npm run generate:module <ModuleName>');
  console.log('Example: npm run generate:module Product');
  process.exit(1);
}

// Convert camelCase / PascalCase to lowercase/kebab-case & Singular/Plural helpers
const rawName = moduleNameArg.trim();
const PascalName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
const camelName = rawName.charAt(0).toLowerCase() + rawName.slice(1);
const singularKebab = camelName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const pluralKebab = `${singularKebab}s`;

const modulesDir = path.resolve(process.cwd(), 'src', 'modules');
const targetModuleDir = path.join(modulesDir, pluralKebab);

if (!fs.existsSync(targetModuleDir)) {
  fs.mkdirSync(targetModuleDir, { recursive: true });
}

console.log(`🚀 Generating ERP Module boilerplate for '${PascalName}' in ${targetModuleDir}...`);

// 1. Model
const modelContent = `const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ${PascalName} = sequelize.define(
  '${PascalName}',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    tableName: '${pluralKebab.replace(/-/g, '_')}',
    timestamps: true,
  }
);

module.exports = { ${PascalName} };
`;

// 2. Repository
const repositoryContent = `const BaseRepository = require('../../core/repositories/base.repository');
const { ${PascalName} } = require('./${singularKebab}.model');

class ${PascalName}Repository extends BaseRepository {
  constructor() {
    super(${PascalName});
  }
}

module.exports = new ${PascalName}Repository();
`;

// 3. Service
const serviceContent = `const BaseService = require('../../core/services/base.service');
const ${camelName}Repository = require('./${singularKebab}.repository');

class ${PascalName}Service extends BaseService {
  constructor() {
    super(${camelName}Repository);
  }
}

module.exports = new ${PascalName}Service();
`;

// 4. Controller
const controllerContent = `const BaseController = require('../../core/controllers/base.controller');
const ${camelName}Service = require('./${singularKebab}.service');

class ${PascalName}Controller extends BaseController {
  constructor() {
    super(${camelName}Service);
  }
}

module.exports = new ${PascalName}Controller();
`;

// 5. Validation
const validationContent = `const Joi = require('joi');

const create = {
  body: Joi.object({
    name: Joi.string().max(150).required(),
    code: Joi.string().max(50).optional(),
    status: Joi.string().valid('active', 'inactive').default('active'),
  }),
};

const update = {
  body: Joi.object({
    name: Joi.string().max(150),
    code: Joi.string().max(50),
    status: Joi.string().valid('active', 'inactive'),
  }),
};

module.exports = {
  create,
  update,
};
`;

// 6. Routes
const routesContent = `const express = require('express');
const router = express.Router();
const ${camelName}Controller = require('./${singularKebab}.controller');
const ${camelName}Validation = require('./${singularKebab}.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');

router.get('/', authenticate, authorize(['${singularKebab}.read']), ${camelName}Controller.list);
router.get('/:id', authenticate, authorize(['${singularKebab}.read']), ${camelName}Controller.getById);
router.post('/', authenticate, authorize(['${singularKebab}.create']), validate(${camelName}Validation.create), ${camelName}Controller.create);
router.patch('/:id', authenticate, authorize(['${singularKebab}.update']), validate(${camelName}Validation.update), ${camelName}Controller.update);
router.delete('/:id', authenticate, authorize(['${singularKebab}.delete']), ${camelName}Controller.delete);

module.exports = router;
`;

const filesToCreate = [
  { filename: `${singularKebab}.model.js`, content: modelContent },
  { filename: `${singularKebab}.repository.js`, content: repositoryContent },
  { filename: `${singularKebab}.service.js`, content: serviceContent },
  { filename: `${singularKebab}.controller.js`, content: controllerContent },
  { filename: `${singularKebab}.validation.js`, content: validationContent },
  { filename: `${singularKebab}.routes.js`, content: routesContent },
];

for (const file of filesToCreate) {
  const filePath = path.join(targetModuleDir, file.filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, file.content, 'utf8');
    console.log(`  ✓ Created ${file.filename}`);
  } else {
    console.log(`  ⚠ Skipped ${file.filename} (already exists)`);
  }
}

console.log(`\n✨ Module '${PascalName}' generated successfully!`);
console.log(`Remember to register your routes in 'src/routes/index.js' if you wish to expose them.`);
