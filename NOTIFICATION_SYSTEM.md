# Notification System Documentation

This document describes the Notification Scheduling Preferences feature implemented for the Teen Sunday School application.

## Overview

The notification system provides comprehensive notification scheduling and delivery capabilities with granular user preferences. Users can control when and how they receive notifications through email and in-app channels.

## Features

### 1. **User Notification Preferences**
Users can customize their notification settings across multiple dimensions:

#### Email Notifications
- Enable/disable email notifications globally
- Control specific notification types:
  - Lesson reminders
  - Event reminders
  - Announcements
  - Group updates
- Email digest options (daily, weekly, bi-weekly, monthly)

#### In-App Notifications
- Enable/disable in-app notifications globally
- Control specific notification types (same categories as email)

#### Scheduling Preferences
- **Quiet Hours**: Define time windows when non-urgent notifications are suppressed
  - Configurable start/end times
  - Timezone support for accurate scheduling
- **Preferred Days**: Optionally limit notifications to specific days of the week
- **Notification Timing**:
  - Customize how many days before lessons to send reminders
  - Set preferred time for lesson reminders
  - Configure hours before events for reminders

#### Advanced Settings
- **Daily Limits**: Cap maximum notifications per day (0 = unlimited)
- **Batching**: Group multiple notifications together
- **Test Notifications**: Send test notifications to verify settings

### 2. **Notification Types**

The system supports various notification types:
- `LESSON_REMINDER` - Upcoming lesson reminders
- `EVENT_REMINDER` - Event reminders
- `ANNOUNCEMENT` - General announcements
- `GROUP_UPDATE` - Group membership/activity updates
- `LESSON_ASSIGNED` - New lesson assignments
- `COMMENT_REPLY` - Comment responses
- `MENTION` - User mentions
- `SYNC_COMPLETE` - Integration sync completion
- `SYNC_ERROR` - Integration sync failures
- `CUSTOM` - Custom notifications

### 3. **Notification Delivery**

#### Delivery Methods
- Email only
- In-app only
- Both email and in-app

#### Priority Levels
- `LOW` - Low priority notifications
- `NORMAL` - Standard notifications
- `HIGH` - Important notifications
- `URGENT` - Critical notifications (bypass quiet hours and daily limits)

#### Status Tracking
Notifications track their lifecycle:
- `PENDING` - Created but not yet sent
- `SCHEDULED` - Scheduled for future delivery
- `SENDING` - Currently being sent
- `SENT` - Successfully sent
- `DELIVERED` - Confirmed delivered (in-app)
- `READ` - User has read the notification
- `FAILED` - Delivery failed
- `CANCELLED` - Cancelled before sending

### 4. **Smart Scheduling**

The system respects user preferences when scheduling notifications:

- **Quiet Hours Check**: Non-urgent notifications are automatically rescheduled if sent during quiet hours
- **Preferred Days Check**: Notifications can be limited to specific days
- **Daily Limit Check**: Prevents notification overload by enforcing daily caps
- **Automatic Rescheduling**: Notifications that can't be sent immediately are automatically rescheduled

### 5. **Background Jobs**

The system uses Bull job queues for reliable notification processing:

#### Notification Queue
- Processes individual notification deliveries
- Retry logic with exponential backoff
- Tracks delivery status and failures

#### Digest Queue
- Generates and sends daily/weekly digest emails
- Batches multiple notifications into a single email

#### Scheduled Jobs
- **Process Pending** (every minute): Processes scheduled notifications that are due
- **Retry Failed** (hourly): Retries failed notifications
- **Daily Digests** (8 AM daily): Schedules digest emails for users
- **Weekly Digests** (Monday 8 AM): Schedules weekly digest emails

## Database Schema

### NotificationPreference
Stores user-specific notification preferences:
- Email and in-app notification toggles
- Quiet hours configuration
- Preferred days
- Notification timing preferences
- Batching and limit settings

### Notification
Stores individual notifications:
- Content (title, message, action URL)
- Delivery settings (method, priority)
- Scheduling information
- Status tracking
- Related entities (group, lesson, event)
- Retry tracking

### NotificationSchedule
Stores recurring notification schedules (for admin-created notifications):
- Recurrence settings (frequency, time, timezone)
- Notification template
- Targeting options (roles, specific users)
- Offset settings for event-based notifications

## API Endpoints

### Preference Management
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/preferences/reset` - Reset to defaults
- `GET /api/notifications/preferences/stats` - Get notification statistics

### Notification Management
- `GET /api/notifications` - Get user's notifications (with pagination and filtering)
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications/test` - Send test notification
- `PUT /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin Endpoints
- `POST /api/notifications` - Create notification (org admin only)

## Frontend Components

### NotificationPreferences Component
A comprehensive settings UI with tabbed interface:
- **Email Tab**: Configure email notification settings
- **In-App Tab**: Configure in-app notification settings
- **Schedule Tab**: Set quiet hours and timing preferences
- **Advanced Tab**: Configure limits, batching, and testing

### NotificationContext
React context providing:
- State management for preferences and notifications
- API integration methods
- Real-time unread count updates (polls every 30 seconds)

## Usage Examples

### Creating a Notification (Backend)
```typescript
import { NotificationService } from './services/notification.service';

const notificationService = new NotificationService();

await notificationService.createNotification({
  userId: 'user-id',
  organizationId: 'org-id',
  type: 'LESSON_REMINDER',
  title: 'Lesson Tomorrow',
  message: 'Don\'t forget about tomorrow\'s lesson on Faith!',
  actionUrl: '/lessons/123',
  deliveryMethod: 'BOTH',
  priority: 'NORMAL',
  scheduledFor: new Date('2025-11-19T18:00:00Z'),
});
```

### Updating Preferences (Frontend)
```javascript
import { useNotification } from '../contexts/NotificationContext';

function MyComponent() {
  const { updatePreferences } = useNotification();

  const handleUpdateQuietHours = async () => {
    await updatePreferences({
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    });
  };
}
```

## Email Templates

The system includes HTML email templates with:
- Responsive design
- Dark/light theme support
- Branded headers and footers
- Clear call-to-action buttons
- Plain text fallbacks

## Configuration

### Environment Variables
```env
# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@teen-sunday-school.com

# Redis (for job queues)
REDIS_URL=redis://localhost:6379
```

## Database Migration

When the database is available, run:
```bash
cd server
npx prisma migrate dev --name add_notification_system
```

This will create the necessary database tables for the notification system.

## Security Considerations

1. **Authentication Required**: All notification endpoints require authentication
2. **User Isolation**: Users can only access their own notifications and preferences
3. **Admin Controls**: Only org admins can create notifications for other users
4. **Email Validation**: Email addresses are validated before sending
5. **Rate Limiting**: API endpoints are protected by rate limiting

## Performance Optimizations

1. **Batch Processing**: Notifications processed in batches to avoid overwhelming the system
2. **Job Queues**: Asynchronous processing prevents blocking the main thread
3. **Indexing**: Database indexes on frequently queried fields (userId, status, scheduledFor)
4. **Cleanup**: Automatic cleanup of old completed/failed jobs
5. **Pagination**: Notification listings support pagination to handle large datasets

## Future Enhancements

Potential improvements for future versions:
- Push notifications (web push, mobile)
- SMS notifications
- Notification templates with variables
- User-defined notification rules
- Notification history and analytics
- A/B testing for notification content
- Rich media support (images, videos)
- Localization support

## Troubleshooting

### Notifications Not Sending
1. Check SMTP configuration in environment variables
2. Verify Redis is running for job queues
3. Check notification queue status
4. Review user's notification preferences
5. Check if user is in quiet hours

### Email Delivery Issues
1. Verify SMTP credentials
2. Check spam/junk folders
3. Review email service logs
4. Test with the "Send Test Notification" feature

### Job Queue Issues
1. Ensure Redis is running and accessible
2. Check server logs for job processing errors
3. Monitor job queue health in Bull dashboard (if configured)
4. Review failed job details for specific errors

## Support

For issues or questions about the notification system, please:
1. Check this documentation
2. Review server logs for errors
3. Test with a test notification
4. Contact the development team with specific error messages
