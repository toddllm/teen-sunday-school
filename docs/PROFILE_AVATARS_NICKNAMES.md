# Profile Avatars & Nicknames Feature

## Overview

The Profile Avatars & Nicknames feature allows teens to personalize their identity within the Teen Sunday School application with safe nicknames and predefined avatars. This feature enhances engagement while maintaining safety through validation and moderation.

## Features

- ✅ **Avatar Selection**: Choose from 20 predefined SVG avatars across multiple categories
- ✅ **Nickname Customization**: Set a unique nickname (3-20 characters) with real-time validation
- ✅ **Profile Preview**: See how your profile appears before saving
- ✅ **Safety Validation**: Built-in profanity filter and content safety checks
- ✅ **Responsive UI**: Works seamlessly on desktop and mobile devices
- ✅ **Dark Mode Support**: Full theme compatibility
- ✅ **Real-time Feedback**: Live validation and character counter

## User Guide

### Accessing Profile Settings

1. Click on the "Profile" link in the navigation bar
2. Navigate to `/settings/profile`
3. You'll see your current profile or a default state

### Setting Up Your Profile

1. **Choose a Nickname**:
   - Enter a nickname between 3-20 characters
   - Only letters, numbers, spaces, hyphens, and underscores allowed
   - Real-time validation shows feedback
   - Character counter helps you stay within limits

2. **Select an Avatar**:
   - Browse avatars by category (All, Animals, Nature, Abstract, Symbols)
   - Click an avatar to select it
   - Selected avatar shows a green checkmark
   - Preview your selection in the Preview section

3. **Save Changes**:
   - Click "Save Changes" to update your profile
   - You'll see a success message when saved
   - Use "Reset" to revert unsaved changes

### Viewing Your Profile

- Your avatar and nickname appear in the navigation bar
- Other users see your profile in games, leaderboards, and interactions
- Leaders can see your real name in tooltips (configurable by admins)

## Technical Documentation

### Database Schema

#### User Model Extensions
```prisma
model User {
  // ... existing fields
  nickname           String?
  avatarId           String?
  profileCompletedAt DateTime?
  nicknameUpdatedAt  DateTime?
  avatar             Avatar?  @relation(...)
}
```

#### Avatar Model
```prisma
model Avatar {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  imageUrl    String
  category    String
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  users       User[]
}
```

### API Endpoints

#### Profile Endpoints

**GET /api/me/profile**
- Retrieves the current user's profile
- Requires authentication
- Response includes user data with avatar relationship

```json
{
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "John",
    "lastName": "Doe",
    "nickname": "CoolCat123",
    "avatarId": "...",
    "avatar": {
      "id": "...",
      "name": "cool-cat",
      "displayName": "Cool Cat",
      "imageUrl": "/avatars/cool-cat.svg",
      "category": "animals"
    },
    "profileCompletedAt": "2024-11-18T...",
    "nicknameUpdatedAt": "2024-11-18T..."
  }
}
```

**PATCH /api/me/profile**
- Updates nickname and/or avatar
- Requires authentication
- Validates nickname according to safety rules
- Returns updated user profile

Request Body:
```json
{
  "nickname": "NewNickname",
  "avatarId": "avatar-id-here"
}
```

Response:
```json
{
  "user": { ...updated profile },
  "message": "Profile updated successfully"
}
```

Error Response (400):
```json
{
  "error": "Invalid nickname",
  "details": [
    "Nickname must be at least 3 characters long",
    "Nickname contains inappropriate language"
  ]
}
```

**POST /api/me/profile/validate-nickname**
- Validates a nickname without saving
- No authentication required
- Returns validation results

Request Body:
```json
{
  "nickname": "TestNickname"
}
```

Response:
```json
{
  "isValid": true,
  "errors": [],
  "sanitized": "TestNickname"
}
```

#### Avatar Endpoints

**GET /api/avatars**
- Returns all active avatars
- Query param: `?groupBy=category` to group by category
- No authentication required

Response (grouped):
```json
{
  "avatars": {
    "animals": [...],
    "nature": [...],
    "abstract": [...],
    "symbols": [...]
  },
  "grouped": true
}
```

**GET /api/avatars/:id**
- Get a single avatar by ID
- No authentication required

**GET /api/avatars/categories**
- Get list of all avatar categories
- No authentication required

**GET /api/avatars/by-category/:category**
- Get avatars for a specific category
- No authentication required

**GET /api/avatars/popular?limit=5**
- Get most popular avatars
- No authentication required
- Default limit: 5, max: 20

**GET /api/admin/avatars/stats**
- Get avatar usage statistics
- Requires authentication and admin role
- Returns usage counts per avatar

### Nickname Validation Rules

#### Character Requirements
- **Length**: 3-20 characters
- **Allowed Characters**: Letters (a-z, A-Z), numbers (0-9), spaces, hyphens (-), underscores (_)
- **Must Contain**: At least one letter
- **Restrictions**:
  - No consecutive special characters (e.g., `--` or `__`)
  - Cannot start or end with special characters
  - Cannot be only whitespace

#### Content Safety
- **Profanity Filter**: Blocks common inappropriate words
- **Pattern Matching**: Detects suspicious patterns (repeated characters, l33t speak)
- **Personal Information**: Blocks emails, URLs, phone numbers

### Frontend Components

#### ProfileContext
Provides profile state and operations:
- `profile`: Current user profile
- `avatars`: Available avatars
- `updateProfile(data)`: Update nickname/avatar
- `validateNickname(nickname)`: Validate without saving
- `getDisplayName()`: Get display name (nickname or firstName)
- `isProfileComplete()`: Check if profile has both nickname and avatar

#### Components

**UserDisplay** (`/src/components/profile/UserDisplay.jsx`)
- Reusable component for displaying avatar + nickname
- Size variants: small, medium, large
- Supports inline and block display
- Optional real name tooltip for leaders

**AvatarSelector** (`/src/components/profile/AvatarSelector.jsx`)
- Grid of selectable avatars
- Category filtering
- Visual selection feedback
- Responsive grid layout

**NicknameInput** (`/src/components/profile/NicknameInput.jsx`)
- Input field with real-time validation
- Character counter
- Debounced validation (500ms)
- Visual feedback (success/error states)

**ProfileSettingsPage** (`/src/pages/ProfileSettingsPage.jsx`)
- Complete profile management interface
- Preview section
- Save/Reset functionality
- Success/error messaging

### Integration

#### Adding ProfileProvider to Your App

The ProfileProvider is already integrated in `src/index.js`:

```jsx
<AuthProvider>
  <ProfileProvider>
    {/* Other providers */}
    <App />
  </ProfileProvider>
</AuthProvider>
```

#### Using Profile Data in Components

```jsx
import { useProfile } from '../contexts/ProfileContext';

function MyComponent() {
  const { profile, getDisplayName, updateProfile } = useProfile();

  return (
    <div>
      <p>Welcome, {getDisplayName()}!</p>
      {profile?.avatar && (
        <img src={profile.avatar.imageUrl} alt="Avatar" />
      )}
    </div>
  );
}
```

#### Displaying User Profiles

```jsx
import UserDisplay from './components/profile/UserDisplay';

function Leaderboard() {
  const users = [...]; // Array of users with profile data

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <UserDisplay
            nickname={user.nickname}
            firstName={user.firstName}
            avatar={user.avatar}
            size="medium"
          />
        </li>
      ))}
    </ul>
  );
}
```

## Setup & Deployment

### Database Migration

1. Ensure PostgreSQL is running
2. Run the Prisma migration:
   ```bash
   cd server
   npm run db:migrate
   ```

3. Seed avatars:
   ```bash
   npx ts-node src/seeds/avatars.seed.ts
   ```

### Environment Variables

No additional environment variables required beyond existing configuration.

### Avatar Assets

Avatar SVG files are located in `/public/avatars/`. The seed script references these files via the `/avatars/` URL path.

To add new avatars:
1. Add SVG file to `/public/avatars/`
2. Update `/server/src/seeds/avatars.seed.ts` with new avatar data
3. Run seed script

## Permissions & Privacy

### User Permissions
- **Teens**: Can update their own nickname and avatar
- **Leaders**: See nicknames and avatars, optional real name tooltip
- **Admins**: Can view avatar usage statistics

### Privacy Settings
Currently, nicknames and avatars are visible to all users within the organization. Future enhancements may include:
- Profile visibility settings
- Option to hide from specific groups
- Admin approval for nicknames

## Metrics & Analytics

### Tracked Metrics
- **Profile Completion Rate**: Percentage of users with both nickname and avatar
- **Avatar Usage**: Most popular avatars
- **Nickname Changes**: Frequency of nickname updates

### Accessing Metrics (Admin Only)
```bash
GET /api/admin/avatars/stats
```

## Troubleshooting

### Common Issues

**Profile not loading**
- Check that AuthProvider and ProfileProvider are properly wrapped in index.js
- Verify API endpoint `/api/me/profile` is accessible
- Check browser console for errors

**Avatars not displaying**
- Verify avatar SVG files exist in `/public/avatars/`
- Check that seed script ran successfully
- Confirm avatar URLs in database match file paths

**Nickname validation failing**
- Review validation rules in `/server/src/services/nicknameValidator.ts`
- Check profanity filter in `/server/src/utils/profanityFilter.ts`
- Test validation endpoint: `POST /api/me/profile/validate-nickname`

**Changes not saving**
- Check authentication token is valid
- Verify PATCH endpoint permissions
- Review server logs for errors

## Future Enhancements

- [ ] Custom avatar uploads (with moderation)
- [ ] Nickname uniqueness enforcement
- [ ] Profile themes/colors
- [ ] Profile badges/achievements integration
- [ ] Nickname history/change log
- [ ] Advanced profanity filtering (AI-based)
- [ ] Admin moderation queue for nicknames
- [ ] Profile privacy settings
- [ ] Social features (following, favorites)

## Contributing

When extending this feature:

1. **Backend Changes**:
   - Add/update Prisma schema models
   - Create/update controllers and services
   - Add appropriate validation
   - Update API documentation

2. **Frontend Changes**:
   - Update ProfileContext for new data/operations
   - Create/update components as needed
   - Maintain consistent styling
   - Test responsive behavior

3. **Testing**:
   - Test nickname validation edge cases
   - Verify avatar display across all pages
   - Check permissions and authentication
   - Test on mobile devices

## Support

For issues or questions:
- Check this documentation
- Review implementation plan: `/docs/implementation-plan-profile-avatars-nicknames.md`
- Check server logs for errors
- Test API endpoints directly

---

**Version**: 1.0.0
**Last Updated**: November 18, 2024
**Author**: Claude Code Assistant
