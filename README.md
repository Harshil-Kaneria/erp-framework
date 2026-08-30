# ERP Backend API - Base Template

A production-ready **Generalized Base Template** for large enterprise ERP systems built with **Node.js**, **Express.js**, **Sequelize**, **PostgreSQL / MySQL**, and **JsonBash 1.2.0**.

Featuring **separated Admin and User tables & authentications**, **Admin-only RBAC**, dual file upload storage helpers, cursor pagination, and an automated module generator.

---

## 🌟 Base Architecture & Key Features

- **Separated Admin & User Data Stores**:
  - **`admins` Table**: Stores administrative accounts. Associated with RBAC Roles & Permissions (`roles`, `permissions`, `admin_roles`, `role_permissions`).
  - **`users` Table**: Stores regular application users/customers with registration, login, and profile management.
- **Dedicated Authentication Middlewares**:
  - `authenticateAdmin`: Verifies Admin JWT and attaches `req.admin` (with permissions array).
  - `authenticateUser`: Verifies User JWT and attaches `req.user`.
- **RBAC for Admins**: Permission authorization (`authorize(['user.read'])`) with special rule: **empty permission array `authorize([])` allows access to ALL authenticated admins**.
- **PostgreSQL / MySQL Dual Compatibility**: Switch seamlessly between **PostgreSQL** and **MySQL** by simply changing `DB_DIALECT=postgres` or `DB_DIALECT=mysql` in `.env`.
- **Dual File Upload Helpers**: Local disk storage helper (`localUploadHelper`) & AWS S3 helper (`s3UploadHelper`).
- **High Performance Cursor Pagination**: Base64url encoded cursor pagination (`?cursor=xxx&limit=20`) for fast sequential access.

---

## 🛠️ API Routes Overview

### 1. Admin Portal (`/api/v1/admin/...`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/v1/admin/auth/login` | Admin login | None |
| `POST` | `/api/v1/admin/auth/refresh` | Admin refresh token | None |
| `POST` | `/api/v1/admin/auth/logout` | Admin logout | `authenticateAdmin` |
| `GET`  | `/api/v1/admin/auth/me` | Current Admin profile & permissions | `authenticateAdmin` |
| `GET`  | `/api/v1/admin/admins` | List Admin accounts | `authenticateAdmin` + `admin.read` |
| `GET`  | `/api/v1/admin/users` | List regular Users | `authenticateAdmin` + `user.read` |
| `POST` | `/api/v1/admin/files/upload` | Upload file | `authenticateAdmin` + `file.upload` |

### 2. Standard User Portal (`/api/v1/user/...`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/v1/user/auth/register` | Register new user account | None |
| `POST` | `/api/v1/user/auth/login` | User login | None |
| `POST` | `/api/v1/user/auth/refresh` | User refresh token | None |
| `POST` | `/api/v1/user/auth/logout` | User logout | `authenticateUser` |
| `GET`  | `/api/v1/user/auth/me` | Current User profile | `authenticateUser` |

---

## 🚀 Quick Start for Local Development

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure your `.env` contains local PostgreSQL or MySQL credentials:

```env
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=erp_db
DB_USER=postgres
DB_PASS=postgres
DB_DIALECT=postgres
```

### 2. Run Database Migrations & Seeders

```bash
# Run database migrations
npm run migrate

# Seed initial roles, permissions, super admin, and sample user
npm run seed
```

**Default Initial Credentials**:
- **Super Admin**: `admin@example.com` / `Admin@123456` (Table: `admins`)
- **Standard User**: `user@example.com` / `User@123456` (Table: `users`)

### 3. Start Development Server

```bash
npm run dev
```

### 4. Postman Collection Export

Generate a 1-click Postman collection file:
```bash
npm run docs:postman
```
Import `postman_collection.json` directly into Postman!

---

## 🏗️ Generating New Domain Modules

To add domain modules (e.g. Orders, Products, Invoices) to this base template:

```bash
npm run generate:module <ModuleName>
```

#### Example:
```bash
npm run generate:module Product
```

Generates clean boilerplate under `src/modules/products/` extending `BaseRepository`, `BaseService`, and `BaseController`.
