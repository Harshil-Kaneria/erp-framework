ERP Backend API
Production backend for a large ERP system built with Node.js, Express.js, Sequelize, PostgreSQL/MySQL, and JsonBash 1.2.0.

The system is expected to grow to 1,000+ APIs and approximately 300 database tables. Most APIs are administrative CRUD operations, while a smaller number contain complex ERP business logic.

The architecture must prioritize:

Maintainability
Developer productivity
Consistent API behavior
Strong RBAC
Reusable CRUD functionality
Clear separation of business logic
Database safety
Easy onboarding for developers
Ability to scale the codebase without unnecessary infrastructure
1. Technology Stack
Runtime
Node.js
Express.js
ORM
Sequelize
Sequelize is the only ORM/database abstraction layer.

Do not introduce Knex.

Sequelize is responsible for:

Models
Associations
Queries
Transactions
Migrations
Seeders
Database
PostgreSQL/MySQL
AWS RDS PostgreSQL/MySQL
PostgreSQL/MySQL is the primary and preferred database.

Do not design database-specific logic for MySQL unless explicitly required.

API Response Framework
JsonBash 1.2.0
JsonBash is responsible for standardized API responses and related API utilities.

Expected features include:

Standard response structure
Success/error helpers
Pagination
pick
sanitize
Validation error formatting
HTTP status helpers
Rate limiting where appropriate
Optional AES-256-GCM payload encryption where explicitly required
Express response helpers
Global error handling
Do not create a second response-formatting abstraction that conflicts with JsonBash.

AWS Services
Current infrastructure:

AWS RDS PostgreSQL/MySQL
AWS Secrets Manager
AWS S3
Potential infrastructure additions should be justified by an actual requirement.

Do not introduce Redis, read replicas, queues, or other infrastructure merely because the API count is large. The system currently has relatively low traffic compared with its API/table count.

2. High-Level Architecture
                    HTTP Request
                         |
                         v
                  Express.js Router
                         |
                         v
                Authentication
                         |
                         v
                 RBAC / Permission
                         |
                         v
                    Validation
                         |
                         v
                    Controller
                         |
                         v
                      Service
                         |
                         v
                    Repository
                         |
                         v
                     Sequelize
                         |
                         v
                  PostgreSQL/MySQL RDS
                         |
                         v
                  Service / Controller
                         |
                         v
                     JsonBash
                         |
                         v
                   HTTP Response

For simple CRUD:

Route
  |
  v
Auth
  |
  v
RBAC
  |
  v
Validation
  |
  v
Generic Controller
  |
  v
Base Service
  |
  v
Base Repository
  |
  v
Sequelize
  |
  v
PostgreSQL/MySQL

For complex business logic:

Route
  |
  v
Auth
  |
  v
RBAC
  |
  v
Validation
  |
  v
Custom Controller
  |
  v
Custom Business Service
  |
  +---- Repository
  |
  +---- Other Services
  |
  +---- Transaction
  |
  v
Sequelize
  |
  v
PostgreSQL/MySQL

3. Important Architectural Rule
Do not treat all APIs equally.

There are two categories.

A. Generic CRUD APIs
Examples:

Countries
Currencies
Departments
Categories
Units
Basic master data
Simple administrative entities
These should use reusable CRUD infrastructure.

B. Business APIs
Examples:

Orders
Invoices
Payments
Inventory transfers
Stock adjustments
Accounting
Approval workflows
Payroll
Complex ERP operations
These must use explicit business services and should not be forced into generic CRUD logic.

4. Folder Structure
Recommended structure:

src/
│
├── app.js
├── server.js
│
├── config/
│   ├── database.js
│   ├── env.js
│   └── aws.js
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.routes.js
│   │   ├── auth.validation.js
│   │   └── auth.constants.js
│   │
│   ├── users/
│   │   ├── user.model.js
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.repository.js
│   │   ├── user.validation.js
│   │   └── user.routes.js
│   │
│   ├── roles/
│   ├── permissions/
│   ├── customers/
│   ├── products/
│   ├── orders/
│   └── ...
│
├── database/
│   ├── migrations/
│   └── seeders/
│
├── core/
│   ├── repositories/
│   │   └── base.repository.js
│   │
│   ├── services/
│   │   └── base.service.js
│   │
│   ├── controllers/
│   │   └── base.controller.js
│   │
│   ├── crud/
│   │   ├── crud.config.js
│   │   ├── crud.service.js
│   │   ├── crud.controller.js
│   │   └── crud.query-builder.js
│   │
│   └── errors/
│       ├── app-error.js
│       └── error-codes.js
│
├── middleware/
│   ├── authenticate.js
│   ├── authorize.js
│   ├── validate.js
│   ├── error-handler.js
│   └── not-found.js
│
├── utils/
│   ├── jwt.js
│   ├── password.js
│   ├── pagination.js
│   ├── logger.js
│   └── audit.js
│
└── routes/
    └── index.js

The exact structure can be adjusted as the project evolves, but the separation of concerns must remain.

5. Controller
Controllers are responsible for HTTP concerns only.

Controllers may access:

req
res
next
route params
query parameters
request body
Controllers should NOT contain significant business logic.

Example:

async function getUser(req, res, next) {
  try {
    const user = await userService.getById(req.params.id);

    return res.jsonbash.success(
      user,
      'User retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
}

6. Service
Services contain business logic.

Example:

async function createUser(data, currentUser) {
  const existingUser =
    await userRepository.findByEmail(data.email);

  if (existingUser) {
    throw new AppError(
      'Email already exists',
      409,
      'USER_EMAIL_EXISTS'
    );
  }

  return userRepository.create(data);
}

Services may:

Validate business rules
Call multiple repositories
Call other services
Start/use transactions
Perform calculations
Enforce workflows
Coordinate complex operations
Services should not depend directly on Express req/res.

7. Repository
A repository is responsible for database access.

It provides an abstraction over Sequelize.

Example:

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email, options = {}) {
    return this.model.findOne({
      where: { email },
      ...options
    });
  }
}

The repository should contain database-specific logic.

Do not put business rules in repositories.

8. Base Repository
A reusable BaseRepository should provide common CRUD operations.

Example:

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findAll(options = {}) {
    return this.model.findAll(options);
  }

  findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  findOne(options = {}) {
    return this.model.findOne(options);
  }

  create(data, options = {}) {
    return this.model.create(data, options);
  }

  update(id, data, options = {}) {
    return this.model.update(
      data,
      {
        where: { id },
        ...options
      }
    );
  }

  delete(id, options = {}) {
    return this.model.destroy({
      where: { id },
      ...options
    });
  }

  count(options = {}) {
    return this.model.count(options);
  }
}

The implementation should support Sequelize transactions through the options parameter.

9. Base Service
Simple CRUD modules should reuse a BaseService.

Example:

class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  getAll(options = {}) {
    return this.repository.findAll(options);
  }

  getById(id, options = {}) {
    return this.repository.findById(id, options);
  }

  create(data, options = {}) {
    return this.repository.create(data, options);
  }

  update(id, data, options = {}) {
    return this.repository.update(id, data, options);
  }

  delete(id, options = {}) {
    return this.repository.delete(id, options);
  }
}

Specific services should extend or compose this functionality.

Do not generate hundreds of duplicate CRUD methods if they contain no custom logic.

10. Code Generator
The project already uses automatic generation for:

Controller
Validation
Service
Repository
Model-related boilerplate where appropriate
Continue using code generation.

However:

Routes should NOT be automatically generated by default.

Routes represent the public API contract and must be intentionally defined.

Example:

router.get(
  '/customers',
  authenticate,
  authorize(['customer.read']),
  validate(customerValidation.list),
  customerController.list
);

This explicit route definition is preferred.

11. Generic CRUD
For simple administrative tables, generic CRUD functionality should be available.

Example configuration:

registerCrud({
  resource: 'departments',
  model: Department,

  permissions: {
    read: 'department.read',
    create: 'department.create',
    update: 'department.update',
    delete: 'department.delete'
  },

  searchable: [
    'name',
    'code'
  ],

  filterable: [
    'status'
  ],

  sortable: [
    'name',
    'createdAt'
  ],

  selectable: [
    'id',
    'name',
    'code',
    'status'
  ]
});

The generic CRUD system should support:

List
Get by ID
Create
Update
Delete
Pagination
Search
Filtering
Sorting
Field selection
Permission checking
Validation
JsonBash responses
12. Generic CRUD Security
Never allow arbitrary Sequelize conditions from HTTP input.

Do NOT expose raw database queries through query parameters.

Bad:

?where={...}

or direct exposure of Sequelize operators.

Instead use explicit allowlists:

{
  searchable: ['name', 'email'],
  filterable: ['status', 'departmentId'],
  sortable: ['name', 'createdAt'],
  selectable: ['id', 'name', 'email']
}

Only configured fields may be used.

13. Routes
Routes are manually defined.

Example:

router.get(
  '/customers',
  authenticate,
  authorize(['customer.read']),
  customerController.list
);

router.post(
  '/customers',
  authenticate,
  authorize(['customer.create']),
  customerController.create
);

router.patch(
  '/customers/:id',
  authenticate,
  authorize(['customer.update']),
  customerController.update
);

router.delete(
  '/customers/:id',
  authenticate,
  authorize(['customer.delete']),
  customerController.delete
);

14. Authentication
Authentication should use JWT.

Recommended architecture:

Client
  |
  | Login
  v
POST /api/v1/auth/login
  |
  v
Validate credentials
  |
  v
Verify password
  |
  v
Load user + roles + permissions
  |
  v
Generate JWT
  |
  v
Client

JWT should identify the authenticated user.

RBAC should determine what that user is allowed to do.

Do not encode the entire permission database into the JWT.

Recommended JWT claims:

{
  "sub": "user-id",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234571490
}

Do not put sensitive information in JWT claims.

15. Authentication API
Initial authentication APIs:

POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/change-password
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

If the ERP requires registration:

POST /api/v1/auth/register

should be enabled only when explicitly required.

16. User and Admin Authentication
Do NOT create separate authentication implementations for:

/user/login
/admin/login

unless there is a specific security requirement.

Prefer:

POST /api/v1/auth/login

The user authenticates normally.

RBAC determines whether they can access:

user.read
order.read
invoice.approve
admin.users.read
admin.users.update

For example:

User
 └── role: employee

Admin
 └── role: admin

Both use the same authentication mechanism.

Authorization is different.

17. RBAC
Roles and permissions are stored in PostgreSQL/MySQL.

Conceptually:

users
  |
  +---- user_roles
           |
           v
         roles
           |
           +---- role_permissions
                     |
                     v
                 permissions

Permission naming convention:

resource.action

Examples:

user.read
user.create
user.update
user.delete

customer.read
customer.create
customer.update
customer.delete

invoice.read
invoice.create
invoice.approve
invoice.cancel

inventory.read
inventory.transfer
inventory.adjust

payment.read
payment.create
payment.refund

18. RBAC Middleware
Authorization must be enforced on the backend.

Example:

router.post(
  '/invoices/:id/approve',
  authenticate,
  authorize(['invoice.approve']),
  invoiceController.approve
);

The frontend may hide UI elements based on permissions, but this is NOT a security mechanism.

The backend must independently enforce authorization.

19. Permission ANY / ALL
The authorization middleware should explicitly support both semantics.

Example:

authorize.any([
  'invoice.approve',
  'invoice.admin'
]);

and:

authorize.all([
  'invoice.read',
  'invoice.approve'
]);

Do not make the meaning of a permission array ambiguous.

20. Password Security
Passwords must never be stored in plaintext.

Use a strong password hashing algorithm such as Argon2id or bcrypt with an appropriate cost factor.

Never return password hashes in API responses.

Use JsonBash sanitize as an additional safety layer.

Example sensitive fields:

password
passwordHash
refreshToken
resetToken
otp
otpSecret
twoFactorSecret
internalSecurityData

21. JWT Secret Management
JWT secrets must NOT be committed to Git.

Use AWS Secrets Manager in production.

Example configuration concept:

AWS Secrets Manager
        |
        v
Node.js application
        |
        v
JWT signing secret

Do not put secrets into:

Git
README
source code
NEXT_PUBLIC_* variables
frontend bundles

22. JWT Strategy
Use short-lived access tokens.

Recommended initial approach:

Access Token
    |
    └── short expiration

Refresh Token
    |
    └── longer expiration

Refresh tokens should be handled carefully and preferably be revocable.

If refresh tokens are stored server-side, store a secure hash/reference rather than unnecessarily storing the raw token.

JWT authentication must support logout/revocation strategy appropriate to the application.

23. JsonBash Response Standard
All APIs should return a consistent response format.

Success:

{
  "success": true,
  "statusCode": 200,
  "statusText": "OK",
  "message": "Users retrieved successfully",
  "data": []
}

Error:

{
  "success": false,
  "statusCode": 404,
  "statusText": "Not Found",
  "message": "User not found"
}

Validation:

{
  "success": false,
  "statusCode": 422,
  "statusText": "Unprocessable Entity",
  "message": "Invalid input parameters",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}

Use JsonBash rather than manually implementing response formatting throughout controllers.

24. Error Handling
Use a centralized error handler.

Example:

app.use(
  jsonbash.errorHandler({
    stackTrace: process.env.NODE_ENV !== 'production'
  })
);

Business/application errors should use a custom AppError.

Example:

throw new AppError(
  'Customer not found',
  404,
  'CUSTOMER_NOT_FOUND'
);

Never expose:

SQL errors
database credentials
internal paths
stack traces
secrets
internal implementation details
in production responses.

25. Validation
Every endpoint accepting user-controlled data must validate:

body
params
query
Use the project's selected validation library consistently.

JsonBash can normalize validation errors.

Validation belongs before business logic.

Flow:

Request
  |
  v
Validation
  |
  v
Controller
  |
  v
Service

26. Pagination
All large list APIs should use pagination.

Standard query parameters:

?page=1&limit=20

Optional:

?search=john
&status=active
&sort=-createdAt

The generic CRUD query builder should provide common pagination/search/filter/sort behavior.

Do not allow unlimited database queries from public/admin APIs.

Set a maximum page size.

Example:

default limit: 20
maximum limit: 100

The exact values can be configured.

27. Sequelize Transactions
Complex business operations must use transactions.

Example:

await sequelize.transaction(async (transaction) => {
  const order = await orderRepository.create(
    orderData,
    { transaction }
  );

  await inventoryService.reserve(
    order.items,
    { transaction }
  );

  await accountingService.createEntry(
    order,
    { transaction }
  );
});

If any operation fails, the transaction should roll back.

Transactions are especially important for:

Orders
Inventory
Payments
Accounting
Invoice workflows
Stock transfers
Financial operations
28. Sequelize Migrations
Use Sequelize migrations.

Do NOT use Knex.

Do NOT use:

sequelize.sync({ alter: true })

as the production schema management strategy.

Migrations should be version controlled.

Example:

database/
└── migrations/
    ├── 001-create-users.js
    ├── 002-create-roles.js
    ├── 003-create-permissions.js
    └── 004-create-user-roles.js

Production deployment:

npx sequelize-cli db:migrate

29. Seeders
Use Sequelize seeders.

Seeders should be used for controlled initial/reference data such as:

Roles
Permissions
Default system configuration
Required master/reference data
Example:

database/
└── seeders/
    ├── 001-create-roles.js
    ├── 002-create-permissions.js
    └── 003-create-admin-role.js

Do not use seeders as a replacement for migrations.

30. AWS S3
S3 is used for file/object storage.

For large files, prefer presigned URLs.

Preferred flow:

Next.js
   |
   v
POST /api/v1/files/presign
   |
   v
Express
   |
   v
Generate S3 presigned URL
   |
   v
Next.js
   |
   v
S3

Avoid routing large files unnecessarily through the Node.js API server.

31. AWS Secrets Manager
Production secrets should be stored in AWS Secrets Manager.

Examples:

DATABASE_PASSWORD
JWT_SECRET
JWT_REFRESH_SECRET
AWS credentials where required
Encryption keys
Third-party API credentials

Never commit secrets to source control.

32. Rate Limiting
JsonBash 1.2.0 provides rate-limiting functionality.

Use stricter limits for sensitive endpoints:

POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/refresh
POST /auth/otp

Example:

jsonbash.rateLimiter({
  windowMs: 60 * 1000,
  max: 5
});

The rate limiter should not be considered complete DDoS protection.

Infrastructure-level protection can be added later if required.

33. JsonBash Encryption
JsonBash AES-256-GCM encryption should NOT automatically be enabled for every API without a specific requirement.

Normal API transport should use HTTPS/TLS.

Application-level payload encryption should be used selectively when required.

Encryption keys must never be hardcoded.

Use AWS Secrets Manager.

34. Response Sanitization
Sensitive fields must never be exposed.

Use Sequelize field selection where possible:

User.findByPk(id, {
  attributes: [
    'id',
    'name',
    'email'
  ]
});

JsonBash pick and sanitize can provide an additional response-layer safety mechanism.

Prefer:

Database query
    |
    v
Select only required fields
    |
    v
Service
    |
    v
JsonBash sanitize/pick where required
    |
    v
Client

35. Audit Logging
ERP administrative actions should support audit logging.

Important events include:

CREATE
UPDATE
DELETE
APPROVE
REJECT
CANCEL
PAY
REFUND
ROLE changes
PERMISSION changes
Security events

Audit information should include where appropriate:

userId
action
resource
resourceId
timestamp
IP
before/after changes

Do not unnecessarily audit every read request.

36. Logging
Use structured application logging.

Logs should make it possible to identify:

request ID
user ID
endpoint
HTTP method
status code
response time
error code

Never log:

password
JWT
refresh token
secret
encryption key
sensitive personal data unnecessarily

37. API Versioning
Use API versioning.

Example:

/api/v1/auth/login
/api/v1/users
/api/v1/orders
/api/v1/admin/users

Future breaking changes can use:

/api/v2/...

38. Admin APIs
Admin APIs should use the same authentication mechanism but stronger authorization.

Example:

GET /api/v1/admin/users

requires:

admin.users.read

Do not rely on URL naming alone for security.

This is insufficient:

/admin/users

The backend must enforce the permission.

39. Repository Rules
Repositories should:

Talk to Sequelize/database
Encapsulate reusable database queries
Accept Sequelize options
Support transactions
Avoid business rules
Repositories should NOT:

Access Express req
Access Express res
Perform authorization
Decide business workflows
Format HTTP responses
40. Service Rules
Services should:

Contain business rules
Coordinate repositories
Coordinate other services
Handle workflows
Use transactions when needed
Services should NOT:

Depend on Express req/res
Return HTTP response objects
Implement route-level authorization
Directly format JsonBash responses
41. Controller Rules
Controllers should:

Receive HTTP request
Call service
Return JsonBash response
Pass errors to error middleware
Controllers should stay thin.

Avoid:

500-line controller

Prefer:

Controller
   |
   v
Service
   |
   v
Repository

42. What Should Be Automated
The project generator should automate:

Model boilerplate
Controller
Service
Repository
Validation
Tests where applicable

But routes should remain explicit.

The generator should also support creating a module for a Sequelize model.

Example:

npm run generate:module Customer

Expected output:

customer/
├── customer.controller.js
├── customer.service.js
├── customer.repository.js
├── customer.validation.js
└── customer.routes.js

Whether the route file is actually registered should remain a developer decision.

43. What Should NOT Be Automatically Generated
Do not automatically generate public API access for every database table.

Examples of tables that may not need CRUD APIs:

audit_logs
sessions
internal_config
system_logs
migration tables
internal accounting tables
security tables

A database table is not automatically an API resource.

44. Development Philosophy
Prefer:

Simple things → generic reusable infrastructure

Complex things → explicit business logic

Do not abstract business logic merely to reduce file count.

The purpose of abstraction is to reduce duplication while keeping business behavior understandable.

45. Authentication Implementation Target
Initial authentication module should implement:

POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/change-password
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

Login flow:

POST /auth/login
       |
       v
Validate request
       |
       v
Find user
       |
       v
Check account status
       |
       v
Verify password
       |
       v
Load roles/permissions as needed
       |
       v
Generate access token
       |
       v
Generate refresh token
       |
       v
Return JsonBash response

Example successful response:

{
  "success": true,
  "statusCode": 200,
  "statusText": "OK",
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com"
    }
  }
}

Never return:

password
passwordHash
internal security fields

46. Authentication Security Requirements
Implement:

Password hashing
JWT access token
Refresh token
Token expiration
Account status checks
Permission middleware
Secure logout/revocation strategy
Login rate limiting
Password reset token expiration
No sensitive information in JWT payload
No secrets in source control
JWT signing secrets must come from secure configuration/AWS Secrets Manager.

47. Coding Standards
Prefer:

async/await
clear naming
small controllers
business logic in services
database access in repositories
reusable base classes
explicit transactions
explicit permission checks
consistent error codes
consistent API responses
Avoid:

Massive controllers
Business logic in routes
Business logic in repositories
Raw SQL scattered throughout services
Duplicate CRUD implementations
Duplicate response formatting
Direct database access from controllers
Secrets committed to Git
Automatic routes for every model
48. Core Principle
The backend should make this easy:

300 tables
      |
      v
Reusable infrastructure
      |
      v
Simple CRUD APIs generated quickly
      |
      v
Developer focuses on complex ERP business logic

The goal is not to eliminate code.

The goal is to eliminate repetitive code while keeping important business behavior explicit.

49. Final Architecture Decision
The backend technology decisions are:

Node.js
   +
Express.js
   +
Sequelize
   +
PostgreSQL/MySQL
   +
JsonBash 1.2.0
   +
AWS RDS
   +
AWS Secrets Manager
   +
AWS S3

Do NOT introduce:

Knex
Prisma
Redis
MongoDB
MySQL

unless there is a concrete technical requirement and the architecture is intentionally reviewed.

Current traffic does not justify additional infrastructure purely because the project has many APIs.

50. First Development Priority
Implement the backend foundation in this order:

Project/bootstrap configuration
PostgreSQL/MySQL + Sequelize connection
Sequelize CLI configuration
Migration system
Seeder system
Base error system
JsonBash integration
Authentication
JWT middleware
RBAC middleware
Permission system
BaseRepository
BaseService
Generic CRUD/query builder
Code generator
Audit logging
First real ERP modules
Tests for core infrastructure
The first real business modules should validate the architecture before generating hundreds of CRUD modules.

51. Non-Negotiable Rules for AI Coding Agents
When modifying this project:

Do not introduce Knex.
Do not replace Sequelize.
Do not replace JsonBash.
Do not introduce Redis unless explicitly requested.
Do not automatically create/register routes for database tables.
Do not put business logic in controllers.
Do not put business logic in repositories.
Do not access Express request/response objects inside services.
Do not expose sensitive database fields.
Do not store secrets in source code.
Do not use sequelize.sync({ alter: true }) for production schema management.
Use Sequelize migrations for schema changes.
Use Sequelize seeders for controlled initial/reference data.
Use transactions for multi-step business operations.
Backend authorization must never rely on frontend checks.
Generic CRUD must use explicit field allowlists for filtering/sorting/search.
Complex ERP workflows must use custom services.
Preserve existing architecture when adding new modules.
Before introducing a new dependency, verify that existing project dependencies cannot already solve the problem.
Prefer reusable infrastructure over repetitive CRUD code, but do not abstract business rules unnecessarily.