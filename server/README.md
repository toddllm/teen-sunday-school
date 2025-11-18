# Teen Sunday School - Backend Server

This is the backend API server for the Teen Sunday School application, providing user management, authentication, and bulk user import functionality.

## Features

- User authentication and authorization (JWT-based)
- Organization management
- Bulk user import from CSV files
- Email invitation system
- Role-based access control (Super Admin, Org Admin, Instructor, Student)
- Rate limiting and security features

## Tech Stack

- **Node.js** with **Express.js**
- **PostgreSQL** database
- **Sequelize** ORM
- **JWT** for authentication
- **SendGrid** for email delivery
- **Multer** for file uploads
- **CSV parsing** for bulk imports

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- SendGrid API key (for email invitations)

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Set database credentials
   - Add JWT secret (minimum 32 characters)
   - Add SendGrid API key
   - Configure other settings as needed

5. Create the PostgreSQL database:
   ```bash
   createdb teen_sunday_school
   ```

6. Start the server in development mode:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Database Setup

The server will automatically create and sync database tables in development mode. For production, you should use proper migrations.

**Database Tables:**
- `organizations` - Organization/church information
- `users` - User accounts
- `import_jobs` - Bulk import job tracking
- `import_rows` - Individual rows in import jobs
- `invitations` - User invitation tokens

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user with invitation token
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (authenticated)
- `GET /api/auth/invitations/:token` - Validate invitation token

### Bulk Import (Org Admin only)

- `POST /api/admin/orgs/:orgId/user-imports` - Upload CSV file
- `POST /api/admin/orgs/:orgId/user-imports/:jobId/mapping` - Set column mapping and validate
- `POST /api/admin/orgs/:orgId/user-imports/:jobId/process` - Start processing import
- `GET /api/admin/orgs/:orgId/user-imports/:jobId` - Get import job status
- `GET /api/admin/orgs/:orgId/user-imports` - List all import jobs
- `DELETE /api/admin/orgs/:orgId/user-imports/:jobId` - Cancel import job

## Bulk Import Flow

1. **Upload CSV**: Org admin uploads a CSV file
2. **Column Mapping**: System suggests column mappings, admin confirms
3. **Validation**: System validates email formats, checks for duplicates
4. **Processing**: Creates user records and sends invitation emails
5. **Monitoring**: Admin can track progress and view results

## CSV Format

The CSV file should include at minimum:
- Email (required)
- First Name (required)
- Last Name (required)
- Group (optional)
- Role (optional: student, instructor, org_admin)

**Example CSV:**
```csv
Email,First Name,Last Name,Group,Role
john@example.com,John,Doe,Youth Group,student
jane@example.com,Jane,Smith,Teen Class,instructor
```

## Environment Variables

See `.env.example` for all available configuration options:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `DB_*` - Database configuration
- `JWT_SECRET` - Secret key for JWT tokens
- `SENDGRID_API_KEY` - SendGrid API key
- `CLIENT_URL` - Frontend URL for CORS and invitation links
- `MAX_IMPORT_ROWS` - Maximum rows per import (default: 1000)
- `MAX_FILE_SIZE_MB` - Maximum CSV file size (default: 5MB)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- Input validation with Joi
- SQL injection prevention (Sequelize ORM)
- File upload validation

## Rate Limits

- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Import uploads: 10 per hour per organization

## Development

Start the server with auto-reload:
```bash
npm run dev
```

View logs in development mode for debugging.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   pm2 start src/index.js --name teen-sunday-school-api
   ```
3. Set up a reverse proxy (nginx) for SSL/TLS
4. Configure database backups
5. Monitor logs and performance

## Troubleshooting

**Database connection errors:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

**Email sending issues:**
- Verify SendGrid API key
- Check email service logs
- Ensure `FROM_EMAIL` is verified in SendGrid

**Import failures:**
- Check CSV format matches requirements
- Verify file size is under limit
- Review validation errors in response

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
