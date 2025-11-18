# Teen Sunday School - Backend Server

Express.js backend with PostgreSQL database and Prisma ORM.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and configuration.

### 3. Set Up Database

```bash
# Run migrations
npx prisma migrate dev

# Seed initial data (roles, permissions, admin user)
npm run db:seed
```

### 4. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed initial data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:generate` - Generate Prisma client

## Default Credentials

After seeding, a default super admin is created:

- **Email:** admin@example.com
- **Password:** admin123

⚠️ **Change this password immediately in production!**

## API Documentation

See `ROLES-PERMISSIONS-SETUP.md` in the project root for complete API documentation.

### Base URL

- Development: `http://localhost:3001/api`
- Production: Update `CORS_ORIGIN` in `.env`

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── db/
│   │   └── seed.js         # Database seeding
│   ├── middleware/
│   │   └── auth.js         # Auth middleware
│   ├── routes/
│   │   ├── auth.js         # Auth endpoints
│   │   └── admin.js        # Admin endpoints
│   ├── utils/
│   │   ├── auditLogger.js  # Audit logging
│   │   └── logger.js       # Winston logger
│   └── index.js            # Server entry point
├── logs/                   # Application logs
├── .env                    # Environment config (gitignored)
├── .env.example            # Environment template
└── package.json
```

## Database Management

### View Database

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555

### Reset Database

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Create a new database
3. Run all migrations
4. Run seed scripts

### Create New Migration

```bash
npx prisma migrate dev --name your_migration_name
```

## Logging

Logs are stored in the `logs/` directory:

- `error.log` - Error logs only
- `combined.log` - All logs

In development, logs also appear in the console.

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Rate limiting on API routes
- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator

## Troubleshooting

### "Can't connect to database"

1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database exists

### "JWT secret is undefined"

Ensure `JWT_SECRET` is set in `.env`

### "Permission denied"

Run database seed to create roles and permissions:
```bash
npm run db:seed
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper `DATABASE_URL`
4. Set up HTTPS
5. Configure firewall rules
6. Set up database backups
7. Configure logging and monitoring

## License

MIT
