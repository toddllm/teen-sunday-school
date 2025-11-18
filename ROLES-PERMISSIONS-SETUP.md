# Roles & Permissions System - Setup Guide

This document provides comprehensive instructions for setting up and using the new roles and permissions system in the Teen Sunday School application.

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)
5. [Database Schema](#database-schema)
6. [Available Roles](#available-roles)
7. [Available Permissions](#available-permissions)
8. [API Endpoints](#api-endpoints)
9. [Frontend Usage](#frontend-usage)
10. [Security Considerations](#security-considerations)

---

## Overview

The roles and permissions system provides granular access control for the Teen Sunday School platform. It includes:

- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based and permission-based access control
- **Audit Logging**: Complete tracking of all role and permission changes
- **Analytics**: Role usage statistics and permission error monitoring
- **Admin UI**: Web interface for managing users, roles, and permissions

## System Architecture

### Backend (Express.js + PostgreSQL + Prisma)

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── db/
│   │   └── seed.js            # Initial data seeding
│   ├── middleware/
│   │   └── auth.js            # Authentication & authorization middleware
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   └── admin.js           # Admin & role management routes
│   ├── utils/
│   │   ├── auditLogger.js     # Audit logging utility
│   │   └── logger.js          # Winston logger
│   └── index.js               # Server entry point
├── .env.example               # Environment variables template
└── package.json
```

### Frontend (React)

```
src/
├── contexts/
│   └── AuthContext.js         # Authentication state management
├── services/
│   └── adminApi.js            # API client for admin operations
├── components/
│   └── ProtectedRoute.js      # Route protection wrapper
├── pages/
│   ├── Login.js               # Login/Register page
│   ├── UserRoleManagement.js  # User & role management UI
│   ├── RolesPermissions.js    # Roles overview UI
│   └── AuditLogs.js           # Audit logs viewer
└── App.js                     # Updated with new routes
```

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+ database
- Git

## Installation & Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE teen_sunday_school;
```

### 3. Configure Environment Variables

Copy the example environment file and update it:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/teen_sunday_school?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3013

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Set Up Frontend Environment

Create `/.env` in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 5. Run Database Migrations

```bash
cd server
npx prisma migrate dev --name init
```

### 6. Seed Initial Data

This creates default roles, permissions, and a super admin user:

```bash
npm run db:seed
```

**Default Super Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **IMPORTANT**: Change this password immediately in production!

### 7. Start the Application

Open two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

The app will be available at:
- Frontend: http://localhost:3013
- Backend API: http://localhost:3001
- Prisma Studio (DB Admin): http://localhost:5555 (run `npm run db:studio` in server/)

## Database Schema

### Core Tables

#### Users
Stores user account information.

```prisma
model User {
  id            String
  email         String   @unique
  passwordHash  String
  firstName     String?
  lastName      String?
  isActive      Boolean  @default(true)
  createdAt     DateTime
  updatedAt     DateTime
  lastLoginAt   DateTime?
}
```

#### Roles
Defines system roles.

```prisma
model Role {
  id          String
  name        String   @unique
  displayName String
  description String?
  isSystem    Boolean  @default(false)
  createdAt   DateTime
  updatedAt   DateTime
}
```

#### Permissions
Granular permissions that can be assigned to roles.

```prisma
model Permission {
  id          String
  name        String   @unique
  displayName String
  description String?
  category    String
  createdAt   DateTime
}
```

#### UserRoles
Many-to-many relationship between users and roles.

```prisma
model UserRole {
  id        String
  userId    String
  roleId    String
  scope     String   @default("global")
  assignedBy String?
  createdAt DateTime
  expiresAt DateTime?
}
```

#### AuditLog
Tracks all changes to roles and permissions.

```prisma
model AuditLog {
  id          String
  action      String
  entityType  String
  entityId    String
  performedBy String
  targetUser  String?
  oldValue    Json?
  newValue    Json?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime
}
```

## Available Roles

The system comes with 6 predefined roles:

### 1. Super Admin
- **Full system access** with all permissions
- Can assign/remove roles
- Can create/modify roles
- Access to audit logs

### 2. Admin
- Administrative access without role management
- Manage users, lessons, groups
- Moderate content
- View analytics

### 3. Editor
- Create and edit lessons
- Moderate comments
- View groups

### 4. Group Leader
- Manage their assigned groups
- View lessons and analytics
- Limited admin access

### 5. Teacher
- Create and publish lessons
- View group information
- Access analytics

### 6. User
- Basic access to view lessons
- Participate in games and activities

## Available Permissions

Permissions are organized by category:

### Users
- `users:read` - View users
- `users:create` - Create users
- `users:update` - Update users
- `users:delete` - Delete users

### Roles
- `roles:read` - View roles
- `roles:assign` - Assign roles to users
- `roles:create` - Create new roles
- `roles:update` - Modify roles
- `roles:delete` - Delete roles

### Lessons
- `lessons:read` - View lessons
- `lessons:create` - Create lessons
- `lessons:update` - Update lessons
- `lessons:delete` - Delete lessons
- `lessons:publish` - Publish lessons

### Moderation
- `comments:moderate` - Moderate comments
- `content:review` - Review content

### Analytics
- `analytics:view` - View analytics
- `analytics:export` - Export data

### Groups
- `groups:read` - View groups
- `groups:create` - Create groups
- `groups:update` - Update groups
- `groups:delete` - Delete groups
- `groups:manage_members` - Manage members

### System
- `system:configure` - System configuration
- `audit:view` - View audit logs

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": { ... }
}
```

#### POST `/api/auth/login`
Authenticate a user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [...],
    "permissions": [...]
  }
}
```

#### GET `/api/auth/me`
Get current user info (requires authentication).

### Admin Routes

All admin routes require authentication and appropriate permissions.

#### GET `/api/admin/users`
Search and list users.

**Query Parameters:**
- `search` - Search term
- `page` - Page number
- `limit` - Results per page
- `role` - Filter by role

**Required Permission:** `users:read`

#### POST `/api/admin/users/:id/roles`
Assign role to user.

**Request:**
```json
{
  "roleId": "role-uuid",
  "scope": "global"
}
```

**Required Permission:** Super Admin only

#### DELETE `/api/admin/users/:id/roles/:roleId`
Remove role from user.

**Required Permission:** Super Admin only

#### GET `/api/admin/roles`
List all roles with permissions.

**Required Permission:** `roles:read`

#### GET `/api/admin/permissions`
List all permissions grouped by category.

**Required Permission:** `roles:read`

#### GET `/api/admin/audit-logs`
Get audit logs with filters.

**Query Parameters:**
- `action` - Filter by action type
- `entityType` - Filter by entity type
- `performedBy` - Filter by user
- `targetUser` - Filter by target user
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `page` - Page number
- `limit` - Results per page

**Required Permission:** `audit:view`

#### GET `/api/admin/analytics/role-usage`
Get role usage statistics.

**Required Permission:** `analytics:view`

#### GET `/api/admin/analytics/permission-errors`
Get permission denial statistics.

**Required Permission:** `analytics:view`

## Frontend Usage

### Using AuthContext

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isSuperAdmin,
    hasPermission,
    hasRole,
    login,
    logout
  } = useAuth();

  // Check if user has a specific permission
  if (hasPermission('lessons:create')) {
    // Show create lesson button
  }

  // Check if user has a specific role
  if (hasRole('admin')) {
    // Show admin features
  }
}
```

### Protected Routes

```javascript
import ProtectedRoute from '../components/ProtectedRoute';

<Route path="/admin" element={
  <ProtectedRoute permission="lessons:update">
    <AdminPage />
  </ProtectedRoute>
} />
```

### Using Admin API

```javascript
import AdminAPI from '../services/adminApi';

// Get users
const data = await AdminAPI.getUsers({ search: 'john', page: 1 });

// Assign role
await AdminAPI.assignRole(userId, roleId, 'global');

// Remove role
await AdminAPI.removeRole(userId, roleId);

// Get audit logs
const logs = await AdminAPI.getAuditLogs({ action: 'role_assigned' });
```

## Security Considerations

### JWT Security
- Tokens expire after 7 days (configurable)
- Stored in localStorage (consider httpOnly cookies for production)
- Automatically included in API requests

### Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Minimum 8 characters required
- Store passwords securely (never in plain text)

### Rate Limiting
- 100 requests per 15 minutes per IP (configurable)
- Prevents brute force attacks

### CORS
- Configured to accept requests only from frontend origin
- Update `CORS_ORIGIN` in production

### Audit Logging
- All role changes are logged
- Includes IP address and user agent
- Tracks who made changes and when

### Best Practices

1. **Change Default Credentials**: Immediately change the default admin password
2. **Use HTTPS**: Always use HTTPS in production
3. **Environment Variables**: Never commit `.env` files
4. **Database Backups**: Regularly backup your database
5. **Update Dependencies**: Keep dependencies up to date
6. **Monitor Logs**: Regularly review audit logs
7. **Principle of Least Privilege**: Assign minimum required permissions

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

### CORS Errors
- Verify `CORS_ORIGIN` matches frontend URL
- Check that backend is running

### Permission Denied
- Check user's roles and permissions in database
- Review audit logs for role assignment history
- Verify JWT token is valid and not expired

### Seed Data Issues
- Drop and recreate database if needed
- Run `npx prisma migrate reset` to reset database
- Re-run `npm run db:seed`

## Next Steps

1. Customize roles and permissions for your needs
2. Set up email verification for new users
3. Implement password reset functionality
4. Add two-factor authentication
5. Set up automated backups
6. Configure logging and monitoring
7. Deploy to production environment

---

For questions or issues, please refer to the main project documentation or create an issue in the repository.
