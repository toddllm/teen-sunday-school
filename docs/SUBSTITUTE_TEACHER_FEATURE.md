# Substitute Teacher Quick-Start Mode

## Overview

The Substitute Teacher Quick-Start Mode is a comprehensive feature designed to make it easy for substitute teachers to jump into teaching a Sunday School class with minimal preparation time. This feature provides all essential materials, group information, and emergency resources in one convenient dashboard.

## Features

### 1. Substitute Dashboard
- **Today's Assignments**: Prominently displays classes scheduled for today
- **Upcoming Assignments**: Shows future substitute teaching assignments
- **Assignment Status Tracking**: Schedules, acceptances, in-progress, and completed statuses
- **Quick Actions**: Accept assignments, start classes, and preview materials

### 2. Quick-Start Package
Provides everything a substitute teacher needs in one place:

#### Overview Tab
- Class and group information (name, grade, age range, student count)
- Today's lesson details (title, quarter/unit/lesson, scripture)
- Regular teacher contact information
- Special instructions from the regular teacher

#### Lesson Tab
- Full lesson title and metadata
- Scripture references
- Lesson overview and objectives
- Direct link to start the presentation

#### Materials Tab
- **Slides**: Pre-loaded presentation slides
- **Interactive Games**: Word scrambles, hangman, word search, wordle
- **Discussion Questions**: Ready-to-use discussion prompts
- **Additional Materials**: Custom links and resources
- **Backup Activities**: Emergency activities if needed

#### Students Tab
- Group leaders with contact information
- Full student roster for attendance
- Student names organized in an easy-to-scan format

#### Emergency Info Tab
- Emergency contacts with names, roles, and phone numbers
- Quick tips for substitute teachers
- Notes section for sharing feedback with regular teacher

### 3. Assignment Management
- Administrators and teachers can create substitute assignments
- Assignment includes:
  - Substitute teacher selection
  - Group assignment
  - Scheduled date and time
  - Pre-selected lesson (optional)
  - Special notes and instructions
  - Emergency contacts
  - Custom materials/resources

## Database Schema

### SubstituteAssignment Model
```prisma
model SubstituteAssignment {
  id                String   @id @default(cuid())
  organizationId    String
  substituteId      String   // User ID of substitute
  groupId           String   // Group being taught
  scheduledDate     DateTime
  lessonId          String?  // Optional pre-assigned lesson
  regularTeacherId  String?  // Regular teacher
  notes             String?  // Special instructions
  emergencyContacts Json?    // Emergency contact list
  customMaterials   Json?    // Additional resources
  status            SubstituteStatus
  acceptedAt        DateTime?
  completedAt       DateTime?
  substituteNotes   String?  // Feedback after class
  createdAt         DateTime
  updatedAt         DateTime
}

enum SubstituteStatus {
  SCHEDULED
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### QuickStartPreset Model
```prisma
model QuickStartPreset {
  id                     String   @id @default(cuid())
  organizationId         String
  name                   String
  description            String?
  includeSlides          Boolean  @default(true)
  includeGames           Boolean  @default(true)
  includeDiscussion      Boolean  @default(true)
  includeScripture       Boolean  @default(true)
  includeGroupRoster     Boolean  @default(true)
  includeEmergencyInfo   Boolean  @default(true)
  autoLoadPresentation   Boolean  @default(true)
  simplifiedView         Boolean  @default(true)
  backupActivities       Json?
  iceBreakers            Json?
  isDefault              Boolean  @default(false)
  createdAt              DateTime
  updatedAt              DateTime
}
```

## API Endpoints

### Substitute Teacher Endpoints
All endpoints require authentication (JWT token).

#### GET /api/substitute/assignments
Get all substitute assignments for the logged-in user.

**Response:**
```json
{
  "assignments": [
    {
      "id": "clxxx...",
      "scheduledDate": "2025-11-20T10:00:00Z",
      "status": "SCHEDULED",
      "notes": "Special instructions..."
    }
  ]
}
```

#### GET /api/substitute/assignments/today
Get today's assignments for quick access.

**Response:** Same as above, filtered for today.

#### GET /api/substitute/assignments/:assignmentId/quick-start
Get the complete quick-start package for a specific assignment.

**Response:**
```json
{
  "package": {
    "assignment": { /* assignment details */ },
    "group": {
      "id": "...",
      "name": "Teen Group",
      "memberCount": 12,
      "leaders": [...],
      "students": [...]
    },
    "lesson": {
      "id": "...",
      "title": "Faith in Action",
      "content": { /* lesson content */ },
      "slides": [...],
      "games": { /* games config */ }
    },
    "regularTeacher": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "preset": { /* quick-start preferences */ }
  }
}
```

#### PATCH /api/substitute/assignments/:assignmentId/status
Update assignment status (accept, start, complete).

**Request Body:**
```json
{
  "status": "ACCEPTED",
  "notes": "Optional feedback notes"
}
```

#### POST /api/substitute/assignments
Create a new substitute assignment (Admin/Teacher only).

**Request Body:**
```json
{
  "substituteId": "user_xxx",
  "groupId": "group_xxx",
  "scheduledDate": "2025-11-20T10:00:00Z",
  "lessonId": "lesson_xxx",
  "regularTeacherId": "user_yyy",
  "notes": "Special instructions",
  "emergencyContacts": [
    {
      "name": "Church Admin",
      "role": "Administrator",
      "phone": "555-1234"
    }
  ]
}
```

## Frontend Components

### Pages
- **SubstituteDashboardPage** (`/src/pages/SubstituteDashboardPage.js`)
  - Main dashboard showing all assignments
  - Today's classes highlighted
  - Upcoming assignments list
  - Help section with tips

### Components
- **QuickStartPackage** (`/src/components/substitute/QuickStartPackage.js`)
  - Tabbed interface for all materials
  - Integration with lesson presentation
  - Notes section for teacher feedback

## User Flow

### For Substitute Teachers

1. **View Assignment**
   - Navigate to `/substitute`
   - See today's and upcoming assignments

2. **Accept Assignment**
   - Click "Accept Assignment" on scheduled assignment
   - Status changes to "ACCEPTED"

3. **Review Materials**
   - Click "Start Class" or "Preview"
   - Review all tabs: Overview, Lesson, Materials, Students, Emergency Info

4. **Start Class**
   - Click "Start Presentation" to begin lesson
   - Use materials tabs as reference during class

5. **Complete Class**
   - Click "Complete Class"
   - Optionally add notes for regular teacher
   - Status changes to "COMPLETED"

### For Administrators/Teachers

1. **Create Assignment**
   - Use API or future admin UI
   - Select substitute teacher
   - Choose group and date
   - Assign lesson
   - Add notes and emergency contacts

2. **Monitor Assignments**
   - View assignment statuses
   - Review substitute teacher feedback

## Installation & Setup

### Database Migration

Run the Prisma migration to create the new tables:

```bash
cd server
npx prisma migrate dev --name add_substitute_teacher_features
```

### Environment Variables

No additional environment variables needed beyond existing configuration.

### Dependencies

All dependencies are already included in the project:
- Frontend: React, React Router
- Backend: Express, Prisma, JWT

## Usage Examples

### Creating an Assignment (API)

```javascript
const response = await fetch('/api/substitute/assignments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    substituteId: 'user_12345',
    groupId: 'group_67890',
    scheduledDate: '2025-11-20T10:00:00Z',
    lessonId: 'lesson_abc123',
    notes: 'The class has been very engaged with games lately',
    emergencyContacts: [
      {
        name: 'Church Office',
        role: 'Main Office',
        phone: '555-0100'
      }
    ]
  })
});
```

### Fetching Quick-Start Package (Frontend)

```javascript
const fetchQuickStart = async (assignmentId) => {
  const response = await fetch(
    `/api/substitute/assignments/${assignmentId}/quick-start`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );

  const data = await response.json();
  return data.package;
};
```

## Future Enhancements

### Planned Features
1. **Admin UI for Creating Assignments**
   - Calendar view for scheduling
   - Bulk assignment creation
   - Assignment templates

2. **Mobile Optimization**
   - Progressive Web App (PWA) support
   - Offline access to materials
   - Push notifications for new assignments

3. **Substitute Teacher Ratings**
   - Regular teachers can rate substitute performance
   - Build preferred substitute lists

4. **Automated Assignment Matching**
   - AI-based matching of substitutes to classes
   - Availability calendar for substitutes
   - Automatic notifications

5. **Enhanced Materials**
   - Video tutorials for activities
   - Pre-recorded lesson introductions
   - Digital handouts

6. **Analytics Dashboard**
   - Track substitute usage
   - Popular backup activities
   - Completion rates

## Troubleshooting

### Common Issues

**Issue**: Can't see assignments
- **Solution**: Ensure user has TEACHER role and assignments exist

**Issue**: Quick-start package not loading
- **Solution**: Verify assignment ID is correct and belongs to logged-in user

**Issue**: Presentation won't start
- **Solution**: Check that lesson is assigned to the assignment

**Issue**: Empty student roster
- **Solution**: Verify group has members with 'member' role

## Security Considerations

- All endpoints require authentication
- Users can only access their own assignments
- Assignment creation restricted to ORG_ADMIN and TEACHER roles
- Sensitive student information should be handled according to organization policies
- Emergency contacts stored in encrypted database

## Testing

### Manual Testing Checklist

- [ ] Create substitute assignment via API
- [ ] View assignment in dashboard
- [ ] Accept assignment
- [ ] View quick-start package
- [ ] Navigate through all tabs
- [ ] Start presentation
- [ ] Complete class with notes
- [ ] Verify status updates

### API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Get today's assignments
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/substitute/assignments/today

# Get quick-start package
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/substitute/assignments/ASSIGNMENT_ID/quick-start
```

## Support

For issues or questions:
1. Check this documentation
2. Review API endpoint documentation
3. Check server logs for errors
4. Contact system administrator

## License

This feature is part of the Teen Sunday School application and follows the same license.

## Contributors

- Initial implementation: Claude AI Assistant
- Feature design: Based on common substitute teacher needs
- Maintained by: Teen Sunday School development team
