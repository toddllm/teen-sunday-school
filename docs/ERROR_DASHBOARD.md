# Error & Incident Dashboard (App Health)

## Overview

The Error & Incident Dashboard is a comprehensive application health monitoring system that tracks errors, manages incidents, and provides insights into application stability. This feature enables administrators to proactively identify and resolve issues affecting the Teen Sunday School application.

## Features

### 1. Real-time Error Tracking
- **Automatic Error Logging**: All errors are automatically captured and logged to the database
- **Error Deduplication**: Similar errors are grouped together to avoid clutter
- **Contextual Information**: Each error includes:
  - HTTP request details (method, path, status code)
  - User information (if authenticated)
  - Stack traces (in development)
  - IP address and user agent
  - Service origin (API, frontend, job queue)
  - Custom metadata

### 2. Error Categorization
- **Error Types**:
  - Authentication Error
  - Authorization Error
  - Validation Error
  - Database Error
  - External API Error
  - Integration Error
  - Rate Limit Error
  - Timeout Error
  - Network Error
  - Configuration Error
  - Internal Error

- **Severity Levels**:
  - **Critical**: System down, data loss risk
  - **High**: Major feature broken
  - **Medium**: Minor feature degraded
  - **Low**: Minor issue with workaround
  - **Info**: Informational only

- **Categories**:
  - Sync
  - Authentication
  - Authorization
  - Integration
  - API
  - Database
  - Frontend
  - Job Queue

### 3. Incident Management
- **Automatic Incident Creation**: Critical errors automatically create incidents
- **Manual Incident Creation**: Admins can manually create incidents
- **Incident Lifecycle**:
  - Open → Acknowledged → Investigating → Resolved → Closed
- **Incident Details**:
  - Title and description
  - Severity level
  - Assignment to team members
  - Timeline tracking
  - Root cause analysis
  - Solution documentation
  - Prevention steps

### 4. Dashboard Analytics
- **Statistics Cards**:
  - Total errors in last 24 hours
  - Critical errors count
  - Open incidents count
  - Average resolution time

- **Error Distribution**:
  - Visual breakdown of errors by type
  - Percentage distribution

- **Trends Analysis**:
  - 7-day error trends chart
  - Breakdown by severity level
  - Visual representation of error patterns

### 5. Filtering and Search
- Filter by:
  - Severity level
  - Status (Open, Acknowledged, Investigating, Resolved)
  - Error type
  - Service (API, Frontend, Job Queue)
- Pagination support for large datasets

## Architecture

### Backend Components

#### 1. Database Models (`server/prisma/schema.prisma`)
- **ErrorLog**: Stores individual error occurrences
- **ErrorIncident**: Groups related errors into incidents
- **Enums**: ErrorType, ErrorSeverity, ErrorCategory, IncidentStatus

#### 2. Error Tracking Service (`server/src/services/error-tracking.service.ts`)
- `logError()`: Logs errors to database
- `getErrorStats()`: Retrieves dashboard statistics
- `getErrorTrends()`: Retrieves error trends over time
- Error fingerprinting for deduplication
- Automatic severity determination
- Automatic categorization

#### 3. Error Logger Middleware (`server/src/middleware/error-logger.ts`)
- Intercepts all errors before the error handler
- Extracts request context and user information
- Maps HTTP status codes to error types
- Asynchronously logs errors to database

#### 4. Error Dashboard Controller (`server/src/controllers/error-dashboard.controller.ts`)
Endpoints:
- `GET /api/admin/errors/stats` - Get error statistics
- `GET /api/admin/errors/trends` - Get error trends
- `GET /api/admin/errors` - List errors with pagination
- `GET /api/admin/errors/:id` - Get error details
- `POST /api/admin/errors/:id/resolve` - Mark error as resolved
- `GET /api/admin/incidents` - List incidents
- `POST /api/admin/incidents` - Create incident
- `GET /api/admin/incidents/:id` - Get incident details
- `PUT /api/admin/incidents/:id` - Update incident
- `POST /api/admin/incidents/:id/assign` - Assign incident
- `POST /api/admin/incidents/:id/resolve` - Resolve incident

#### 5. Routes (`server/src/routes/error-dashboard.routes.ts`)
- All routes require authentication
- All routes require ORG_ADMIN role

### Frontend Components

#### 1. ErrorDashboardPage (`src/pages/ErrorDashboardPage.js`)
- Main dashboard interface
- Three tabs: Recent Errors, Incidents, Trends
- Real-time data fetching
- Interactive filters
- Error resolution actions

#### 2. Styling (`src/pages/ErrorDashboardPage.css`)
- Responsive design
- Color-coded severity badges
- Interactive charts and graphs
- Mobile-friendly layout

## Usage

### Accessing the Dashboard

1. Navigate to the Admin Dashboard (`/admin`)
2. Click on "Error & Incident Dashboard" quick access card
3. Or directly navigate to `/admin/errors`

**Note**: Only users with ORG_ADMIN or SUPER_ADMIN roles can access this feature.

### Viewing Errors

1. The "Recent Errors" tab shows all logged errors
2. Use filters to narrow down by severity, status, or service
3. Click on an error to view detailed information
4. Resolve errors by clicking the "Resolve" button

### Managing Incidents

1. Switch to the "Incidents" tab
2. View all incidents with their status and severity
3. Click on an incident to see details and related errors
4. Update incident status through the API (future UI enhancement)

### Analyzing Trends

1. Switch to the "Trends" tab
2. View a 7-day chart of error occurrences
3. Colors indicate severity levels:
   - Red: Critical
   - Orange: High
   - Yellow: Medium
   - Blue: Low

## Database Migration

Before using this feature, run the Prisma migration:

```bash
cd server
npx prisma migrate dev --name add_error_tracking
```

This will create the necessary database tables:
- `ErrorLog`
- `ErrorIncident`

## Configuration

### Environment Variables

No additional environment variables are required. The feature uses the existing database connection and authentication system.

### Customization

#### Adjusting Error Severity

Edit `server/src/services/error-tracking.service.ts`:

```typescript
function determineErrorSeverity(
  errorType: ErrorType,
  statusCode?: number
): ErrorSeverity {
  // Customize severity logic here
}
```

#### Custom Error Categories

Edit `server/src/services/error-tracking.service.ts`:

```typescript
function categorizeError(error: ErrorContext): ErrorCategory | undefined {
  // Add custom categorization logic
}
```

## Integration with Existing Features

### Winston Logger
The error tracking system integrates with the existing Winston logger. All errors logged via Winston are also captured in the database (when using the error logger middleware).

### Job Queue (Bull)
Errors from background jobs are automatically tracked when they fail. The job queue errors are categorized under the "JOB_QUEUE" category.

### External Integrations
Errors from external API calls (e.g., Planning Center) are tracked and categorized as "INTEGRATION_ERROR" or "EXTERNAL_API_ERROR".

## Security Considerations

1. **Stack Traces**: Only shown in development mode
2. **Sensitive Data**: Request bodies are stored in metadata (ensure no passwords/tokens in query params)
3. **Access Control**: Dashboard is restricted to ORG_ADMIN users
4. **IP Logging**: IP addresses are logged for security auditing

## Performance

- **Asynchronous Logging**: Error logging doesn't block request processing
- **Deduplication**: Similar errors within 24 hours are grouped
- **Pagination**: Large error lists are paginated to reduce load
- **Indexing**: Database indexes on frequently queried fields

## Future Enhancements

1. **Email Notifications**: Alert admins when critical errors occur
2. **Slack/Discord Integration**: Send incident notifications to chat
3. **Advanced Filtering**: Date range, user-specific errors
4. **Error Search**: Full-text search across error messages
5. **Incident UI**: Create and manage incidents from the dashboard
6. **Export Reports**: Download error reports as CSV/PDF
7. **Alert Rules**: Configurable thresholds for automatic alerts
8. **Error Replay**: Recreate error scenarios for debugging

## API Examples

### Get Error Statistics
```javascript
GET /api/admin/errors/stats?hours=24
Authorization: Bearer {token}

Response:
{
  "totalErrors": 42,
  "criticalErrors": 3,
  "openIncidents": 2,
  "avgResolutionTimeMs": 1800000,
  "errorsByType": [
    { "type": "AUTHENTICATION_ERROR", "count": 15 },
    { "type": "VALIDATION_ERROR", "count": 20 },
    ...
  ]
}
```

### List Errors with Filters
```javascript
GET /api/admin/errors?severity=CRITICAL&status=OPEN&page=1&limit=20
Authorization: Bearer {token}

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### Resolve an Error
```javascript
POST /api/admin/errors/{errorId}/resolve
Authorization: Bearer {token}
Content-Type: application/json

{
  "resolution": "Fixed authentication middleware configuration"
}
```

## Troubleshooting

### Errors Not Appearing in Dashboard

1. Verify the error logger middleware is registered in `server/src/index.ts`
2. Check that the middleware comes before the error handler
3. Ensure database migrations have been run
4. Check server logs for error logging failures

### Dashboard Not Loading

1. Verify user has ORG_ADMIN role
2. Check browser console for API errors
3. Ensure backend server is running
4. Verify authentication token is valid

### Missing Error Details

1. Stack traces only appear in development mode
2. Some fields are optional (userId, httpPath, etc.)
3. Check that the error was logged with sufficient context

## Contributing

When adding new features that might generate errors:

1. Use appropriate error types when throwing errors
2. Include meaningful error messages
3. Add custom metadata for debugging context
4. Consider severity when determining error handling

## License

This feature is part of the Teen Sunday School application and follows the same license terms.
