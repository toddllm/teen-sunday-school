# Passage Comments & Group Discussion Feature

This document describes the implementation of the Passage Comments and Group Discussion feature for the Teen Sunday School application.

## Overview

The Passage Comments feature allows users to create groups and have threaded discussions about specific Bible passages. Comments are private to each group, enabling focused study and collaboration.

## Features

### 1. User Authentication
- **Email/Password Sign-in**: Users can create accounts with email and password
- **Anonymous Access**: Guest users can browse without creating an account
- **User Profiles**: Each user has a display name and profile stored in Firestore

### 2. Group Management
- **Create Groups**: Users can create study groups with names and descriptions
- **Group Roles**: Three-tier permission system
  - **Leader**: Full control (create, edit, delete group, moderate comments)
  - **Moderator**: Can moderate comments and manage members
  - **Member**: Can view and comment on passages
- **Group Privacy**: Comments are only visible to group members

### 3. Passage Discussion
- **Contextual Comments**: Add comments directly to Bible passages
- **Threaded Replies**: One level of comment nesting for focused discussions
- **Rich Interactions**:
  - Like/unlike comments
  - Edit your own comments
  - Delete your own comments (or as moderator/leader)
  - Reply to comments
- **Real-time Updates**: Comments update in real-time using Firestore listeners

### 4. Notifications
- **Reply Notifications**: Get notified when someone replies to your comment
- **New Comment Notifications**: Get notified about new comments on passages you've interacted with
- **Notification Bell**: Visual indicator in the navigation bar
- **Mark as Read**: Click notifications to navigate to the relevant passage and mark as read

### 5. User Interface
- **Discussion Tab**: Integrated into Bible Tool page for each passage
- **Group Selector**: Switch between groups when viewing discussions
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Respects the app's theme settings

## Technical Architecture

### Frontend Components

```
src/
├── components/
│   ├── discussion/
│   │   ├── PassageDiscussion.js    # Main discussion container
│   │   ├── CommentThread.js        # Comment and replies display
│   │   ├── CommentForm.js          # Form for adding comments
│   │   └── *.css                   # Component styles
│   └── NotificationBell.js         # Notification dropdown
├── contexts/
│   ├── AuthContext.js              # Authentication state management
│   ├── GroupContext.js             # Group operations
│   └── PassageCommentContext.js    # Comment operations
├── pages/
│   ├── AuthPage.js                 # Login/signup page
│   ├── GroupsPage.js               # Group management page
│   └── BibleToolPage.js            # Updated with discussion integration
└── config/
    └── firebase.js                 # Firebase configuration
```

### Backend (Firebase)

- **Firebase Authentication**: Handles user authentication
- **Cloud Firestore**: NoSQL database for all data
- **Security Rules**: Enforces permissions and data access

### Data Models

#### User
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  role: 'member',
  isAnonymous: boolean
}
```

#### Group
```javascript
{
  name: string,
  description: string,
  createdBy: userId,
  createdAt: timestamp,
  members: [{
    userId: string,
    role: 'leader' | 'moderator' | 'member',
    joinedAt: timestamp
  }],
  memberIds: [userId] // For efficient querying
}
```

#### PassageComment
```javascript
{
  groupId: string,
  passageRef: string,        // e.g., "John 3:16"
  userId: string,
  text: string,
  parentCommentId: string?,  // null for top-level comments
  createdAt: timestamp,
  updatedAt: timestamp,
  likes: [userId],
  edited: boolean
}
```

#### Notification
```javascript
{
  recipientId: string,
  groupId: string,
  passageRef: string,
  commentId: string,
  type: 'reply' | 'new_comment',
  senderId: string,
  read: boolean,
  createdAt: timestamp
}
```

## User Flows

### Creating a Group and Adding Comments

1. User signs in at `/auth`
2. Navigates to `/groups`
3. Clicks "Create Group"
4. Enters group name and description
5. Navigates to `/bible` (Bible Tool)
6. Searches for a passage (e.g., "John 3:16")
7. Scrolls to "Discussion" section
8. Selects their group from the dropdown
9. Types a comment and clicks "Post Comment"
10. Other group members see the comment in real-time

### Replying to Comments

1. User views a passage with existing comments
2. Clicks "💬 Reply" on a comment
3. Types their reply in the form that appears
4. Clicks "Post Comment"
5. The original commenter receives a notification
6. Reply appears nested under the parent comment

### Managing Groups

1. Group leader navigates to `/groups`
2. Sees all groups they're a member of
3. Can:
   - View group details
   - Delete groups they created
   - Add/remove members (future enhancement)
   - Change member roles (future enhancement)

## Security Considerations

### Authentication
- Passwords are handled by Firebase Authentication (never stored in plaintext)
- Anonymous users have limited access
- JWT tokens are used for API authentication

### Authorization
- Firestore security rules enforce group membership requirements
- Comments can only be read by group members
- Users can only edit/delete their own content (or as moderator/leader)
- Role hierarchy prevents privilege escalation

### Data Privacy
- Comments are scoped to groups
- No cross-group data leakage
- User profiles are private to authenticated users

## Performance Optimizations

1. **Real-time Listeners**: Efficient Firestore listeners with automatic cleanup
2. **Indexed Queries**: Composite indexes for fast comment retrieval
3. **Lazy Loading**: User profiles loaded on-demand
4. **Optimistic Updates**: UI updates immediately, syncs in background

## Testing Strategy

### Manual Testing Checklist
- [ ] User can sign up with email/password
- [ ] User can sign in anonymously
- [ ] User can create a group
- [ ] User can add comments to passages
- [ ] User can reply to comments
- [ ] User can edit their own comments
- [ ] User can delete their own comments
- [ ] Group leader can delete any comment
- [ ] Notifications appear for replies
- [ ] Notifications appear for new comments
- [ ] Real-time updates work across multiple tabs/users
- [ ] Dark mode styling works correctly
- [ ] Mobile responsive design works

### Edge Cases to Test
- Deleting a comment with replies
- Rapid-fire comment posting
- Very long comment text
- Special characters in comments
- Switching between groups
- Anonymous user limitations
- Network disconnection and reconnection

## Future Enhancements

### Phase 2 Features
1. **Member Management**: Add/remove members, invite via email
2. **@Mentions**: Tag other group members in comments
3. **Rich Text**: Formatting options for comments (bold, italic, etc.)
4. **Search**: Search within discussion history
5. **Bookmarks**: Save favorite comments or passages
6. **Private Notes**: Personal notes visible only to the user
7. **Comment Reactions**: More than just likes (emoji reactions)

### Phase 3 Features
1. **File Attachments**: Share images or documents in comments
2. **Voice Comments**: Audio recordings as comments
3. **Live Sessions**: Real-time group Bible study with video chat
4. **Study Plans**: Structured reading plans with group progress tracking
5. **Analytics**: Insights into group engagement and popular passages
6. **Mobile Apps**: Native iOS and Android apps

## Maintenance

### Regular Tasks
- Monitor Firebase usage and costs
- Review security rules periodically
- Update dependencies
- Backup Firestore data
- Monitor error logs

### Troubleshooting
See `FIREBASE_SETUP.md` for common issues and solutions.

## API Reference

### AuthContext
```javascript
const {
  currentUser,      // Firebase user object
  userProfile,      // User profile from Firestore
  signup,           // (email, password, displayName) => Promise
  login,            // (email, password) => Promise
  loginAnonymously, // () => Promise
  logout,           // () => Promise
  loading           // boolean
} = useAuth();
```

### GroupContext
```javascript
const {
  userGroups,       // Array of groups user belongs to
  loading,          // boolean
  createGroup,      // (groupData) => Promise<groupId>
  updateGroup,      // (groupId, updates) => Promise
  deleteGroup,      // (groupId) => Promise
  addMember,        // (groupId, userId, role) => Promise
  removeMember,     // (groupId, userId) => Promise
  updateMemberRole, // (groupId, userId, newRole) => Promise
  getGroup,         // (groupId) => Promise<group>
  hasRole,          // (group, userId, requiredRole) => boolean
  isGroupLeader,    // (group, userId) => boolean
  canModerate       // (group, userId) => boolean
} = useGroups();
```

### PassageCommentContext
```javascript
const {
  comments,                 // Object mapping passageRef to comments
  loading,                  // boolean
  addComment,               // (groupId, passageRef, text, parentId?) => Promise<commentId>
  updateComment,            // (commentId, newText) => Promise
  deleteComment,            // (commentId) => Promise
  toggleLike,               // (commentId) => Promise
  subscribeToComments,      // (groupId, passageRef, callback) => unsubscribe
  getComments,              // (groupId, passageRef) => Promise<comments[]>
  getCommentCount,          // (groupId, passageRef) => Promise<number>
  getUserNotifications,     // () => Promise<notifications[]>
  markNotificationRead,     // (notificationId) => Promise
  subscribeToNotifications  // (callback) => unsubscribe
} = usePassageComments();
```

## Contributing

When adding features to the discussion system:

1. Update contexts if adding new data operations
2. Update security rules if changing data access patterns
3. Create composite indexes for new queries
4. Add CSS variables for theming support
5. Test with both light and dark modes
6. Test on mobile devices
7. Update this documentation

## License

Same as the main application license.
