# Church Systems Integration - Setup Guide

This guide will help you set up the Teen Sunday School app with Planning Center integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Planning Center Configuration](#planning-center-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Using the Integration](#using-the-integration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- **Docker and Docker Compose** (recommended for local development)
- **PostgreSQL 14+** (if not using Docker)
- **Redis** (if not using Docker)
- **Planning Center account** with admin access

---

## Development Setup

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   cd teen-sunday-school
   ```

2. **Create environment file:**
   ```bash
   cp server/.env.example server/.env
   ```

3. **Generate encryption key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Copy the output and set it as `ENCRYPTION_KEY` in `server/.env`

4. **Start all services:**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations:**
   ```bash
   docker-compose exec api npx prisma migrate dev
   ```

6. **Seed the database (optional):**
   ```bash
   docker-compose exec api npm run db:seed
   ```

That's it! The application should now be running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379

### Option 2: Manual Setup

1. **Install PostgreSQL 14+**
   - Create a database named `teen_sunday_school`

2. **Install Redis**
   - Start Redis server on default port 6379

3. **Set up backend:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npx prisma migrate dev
   npm run dev
   ```

4. **Set up frontend:**
   ```bash
   cd ..
   npm install
   npm start
   ```

---

## Planning Center Configuration

### Step 1: Create a Planning Center Application

1. Go to https://api.planningcenteronline.com/oauth/applications
2. Click **"New Application"**
3. Fill in the details:
   - **Name:** Teen Sunday School
   - **Description:** Sunday School management app
   - **Redirect URI:** `http://localhost:3001/api/integrations/planning-center/callback`
   - **Scopes:** Check `people` (read access)

4. Click **"Create Application"**

5. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables

Add to `server/.env`:

```bash
PLANNING_CENTER_CLIENT_ID=your_client_id_here
PLANNING_CENTER_CLIENT_SECRET=your_client_secret_here
PLANNING_CENTER_REDIRECT_URI=http://localhost:3001/api/integrations/planning-center/callback
```

### Step 3: Production Configuration

For production deployment:

1. Update the **Redirect URI** in Planning Center:
   ```
   https://your-domain.com/api/integrations/planning-center/callback
   ```

2. Update `server/.env` for production:
   ```bash
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.com
   PLANNING_CENTER_REDIRECT_URI=https://your-domain.com/api/integrations/planning-center/callback
   ```

---

## Database Setup

### Run Migrations

```bash
# Using Docker
docker-compose exec api npx prisma migrate dev

# Or locally
cd server
npx prisma migrate dev
```

### Prisma Studio (Database GUI)

View and edit your database with Prisma Studio:

```bash
# Using Docker
docker-compose exec api npx prisma studio

# Or locally
cd server
npx prisma studio
```

Opens at: http://localhost:5555

### Create First Organization and Admin User

You'll need to create an organization and admin user to get started:

```bash
# Using Docker
docker-compose exec api npm run db:seed

# Or locally
cd server
npm run db:seed
```

This creates:
- Organization: "Demo Church"
- Admin user:
  - Email: admin@demo.church
  - Password: admin123 (change immediately!)
  - Role: ORG_ADMIN

---

## Running the Application

### Start All Services

```bash
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Stop Services

```bash
docker-compose down
```

### Restart After Code Changes

```bash
docker-compose restart api
```

---

## Using the Integration

### Step 1: Log In as Admin

1. Navigate to http://localhost:3000
2. Log in with admin credentials
3. Go to **Admin > Integrations**

### Step 2: Connect to Planning Center

1. Click **"Add Integration"**
2. Select **"Planning Center"**
3. Click **"Connect to Planning Center"**
4. Authorize the app in the Planning Center OAuth screen
5. You'll be redirected back to the app

### Step 3: Map Groups

1. After connecting, you'll see a list of groups from Planning Center
2. For each Planning Center list, select which local group it should map to
3. Or create a new group and map to it
4. Save the mappings

### Step 4: Initial Sync

1. Click **"Sync Now"** to perform the first sync
2. Wait for the sync to complete (check sync logs)
3. Verify that people were added to the correct groups

### Step 5: Configure Automatic Sync

1. In integration settings, enable **"Automatic Sync"**
2. Choose frequency:
   - **Hourly:** Every hour
   - **Daily:** Once per day (recommended)
   - **Weekly:** Once per week
   - **Manual:** Only when you click "Sync Now"
3. Save settings

---

## Troubleshooting

### Connection Issues

**Problem:** Can't connect to Planning Center

**Solutions:**
- Verify `PLANNING_CENTER_CLIENT_ID` and `PLANNING_CENTER_CLIENT_SECRET` are correct
- Check that redirect URI matches exactly (no trailing slashes)
- Ensure Planning Center app has `people` scope enabled
- Check API logs: `docker-compose logs -f api`

### Token Expired

**Problem:** "Token expired" error after some time

**Solutions:**
- Tokens are automatically refreshed
- If refresh fails, disconnect and reconnect to Planning Center
- Check that `ENCRYPTION_KEY` hasn't changed (would invalidate stored credentials)

### Sync Failures

**Problem:** Sync job fails or times out

**Solutions:**
- Check sync logs in the UI for specific errors
- Verify Redis is running: `docker-compose ps redis`
- Check Redis logs: `docker-compose logs redis`
- Manually retry the sync
- For large organizations (1000+ people), consider syncing during off-hours

### Database Connection Errors

**Problem:** Can't connect to database

**Solutions:**
- Verify PostgreSQL is running: `docker-compose ps postgres`
- Check database credentials in `.env`
- Run migrations: `docker-compose exec api npx prisma migrate dev`
- Reset database (WARNING: deletes all data):
  ```bash
  docker-compose down -v
  docker-compose up -d
  docker-compose exec api npx prisma migrate dev
  ```

### Missing People or Groups

**Problem:** Some people or groups not syncing

**Solutions:**
- Check that group mappings are configured correctly
- Verify people in Planning Center have email addresses (required)
- Check sync logs for specific errors
- Ensure groups are set to sync members (`syncMembers: true`)
- Manually trigger a sync after fixing mappings

### Permission Errors

**Problem:** "Insufficient permissions" errors

**Solutions:**
- Verify user has `ORG_ADMIN` role
- Check JWT token is valid (not expired)
- Re-login to get fresh token
- Verify user belongs to the correct organization

### Development Mode Issues

**Problem:** Hot reload not working

**Solutions:**
- Restart the service: `docker-compose restart api`
- Check file watchers aren't exhausted (Linux): `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
- Use local development instead of Docker

---

## Environment Variables Reference

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379

# JWT Authentication
JWT_SECRET=<64-char-random-string>
REFRESH_TOKEN_SECRET=<64-char-random-string>

# Encryption
ENCRYPTION_KEY=<64-char-hex-string>

# Planning Center
PLANNING_CENTER_CLIENT_ID=<from-planning-center>
PLANNING_CENTER_CLIENT_SECRET=<from-planning-center>
PLANNING_CENTER_REDIRECT_URI=<your-callback-url>
```

### Optional Variables

```bash
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Security
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

---

## Production Deployment

### Checklist

- [ ] Use strong, randomly generated secrets for JWT and encryption
- [ ] Set `NODE_ENV=production`
- [ ] Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)
- [ ] Use managed Redis (AWS ElastiCache, Redis Cloud, etc.)
- [ ] Enable HTTPS (required for OAuth)
- [ ] Set correct CORS origins
- [ ] Configure rate limiting appropriately
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Review and update Planning Center redirect URI
- [ ] Test OAuth flow end-to-end
- [ ] Test sync with production data (small subset first)

### Recommended Platforms

- **Heroku** (easiest)
- **Railway** (simple and affordable)
- **Render** (great for Node.js)
- **AWS** (most flexible, requires more setup)
- **DigitalOcean App Platform**

### Example: Deploy to Railway

1. Create account at https://railway.app
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`
4. Create project: `railway init`
5. Add PostgreSQL: `railway add -d postgres`
6. Add Redis: `railway add -d redis`
7. Set environment variables in Railway dashboard
8. Deploy: `railway up`

---

## Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review API logs for specific errors
3. Check Planning Center API status: https://status.planningcenteronline.com
4. Open an issue on GitHub

---

## Next Steps

- [ ] Set up email notifications for sync failures
- [ ] Configure monitoring (Sentry, LogRocket, etc.)
- [ ] Add webhook support for real-time updates
- [ ] Implement bi-directional sync
- [ ] Add support for other church management systems (CCB, Elvanto, etc.)
- [ ] Create analytics dashboards
