# Firebase Setup Guide for Passage Comments Feature

This guide will help you set up Firebase for the passage comments and discussion feature.

## Prerequisites

- A Google account
- Firebase CLI (optional, for advanced setup)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "teen-sunday-school")
4. Accept the terms and click "Continue"
5. Choose whether to enable Google Analytics (optional)
6. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the Web icon (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Teen Sunday School Web")
3. Check "Also set up Firebase Hosting" if you want to deploy on Firebase (optional)
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need this for Step 4

## Step 3: Enable Authentication

1. In the Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following sign-in providers:
   - **Email/Password**: Click on it → Toggle "Enable" → Save
   - **Anonymous** (optional but recommended for guest access): Click on it → Toggle "Enable" → Save

## Step 4: Set Up Firestore Database

1. In the Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (we'll add security rules in Step 6)
4. Select a Firestore location (choose one closest to your users)
5. Click "Enable"

## Step 5: Configure Environment Variables

Create a `.env` file in your project root (if it doesn't exist) with the following content:

```bash
# Bible API Configuration
REACT_APP_BIBLE_API_KEY=your_bible_api_key_here

# Firebase Configuration (from Step 2)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Replace the placeholders with your actual Firebase configuration values from Step 2.

⚠️ **Important**: Never commit your `.env` file to version control. Make sure `.env` is in your `.gitignore`.

## Step 6: Set Up Firestore Security Rules

Security rules are critical to protect your data. Follow these steps:

1. In the Firebase Console, go to "Firestore Database"
2. Click on the "Rules" tab
3. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user is a group member
    function isGroupMember(groupId) {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/groups/$(groupId)) &&
             request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;
    }

    // Helper function to check if user has a specific role in a group
    function hasGroupRole(groupId, role) {
      let group = get(/databases/$(database)/documents/groups/$(groupId)).data;
      let member = group.members[request.auth.uid];
      let roleHierarchy = {
        'leader': 3,
        'moderator': 2,
        'member': 1
      };
      return isGroupMember(groupId) &&
             roleHierarchy[member.role] >= roleHierarchy[role];
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own profile and create it on signup
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if false; // Users cannot delete their own profile
    }

    // Groups collection
    match /groups/{groupId} {
      // Any authenticated user can create a group
      allow create: if isAuthenticated() &&
                      request.auth.uid == request.resource.data.createdBy;

      // Group members can read group data
      allow read: if isGroupMember(groupId);

      // Only group leaders can update or delete groups
      allow update: if hasGroupRole(groupId, 'leader');
      allow delete: if hasGroupRole(groupId, 'leader');
    }

    // Passage comments collection
    match /passageComments/{commentId} {
      // Group members can read comments for their groups
      allow read: if isGroupMember(resource.data.groupId);

      // Authenticated users can create comments in groups they belong to
      allow create: if isAuthenticated() &&
                      isGroupMember(request.resource.data.groupId) &&
                      request.auth.uid == request.resource.data.userId;

      // Users can update their own comments
      allow update: if isAuthenticated() &&
                      request.auth.uid == resource.data.userId;

      // Users can delete their own comments, or moderators/leaders can delete any comment
      allow delete: if isAuthenticated() &&
                      (request.auth.uid == resource.data.userId ||
                       hasGroupRole(resource.data.groupId, 'moderator'));
    }

    // Notifications collection
    match /notifications/{notificationId} {
      // Users can only read their own notifications
      allow read: if isAuthenticated() &&
                    request.auth.uid == resource.data.recipientId;

      // System/users can create notifications for other users
      allow create: if isAuthenticated();

      // Users can update their own notifications (mark as read)
      allow update: if isAuthenticated() &&
                      request.auth.uid == resource.data.recipientId;

      // Users can delete their own notifications
      allow delete: if isAuthenticated() &&
                      request.auth.uid == resource.data.recipientId;
    }
  }
}
```

4. Click "Publish" to deploy the security rules

## Step 7: Create Firestore Indexes

For optimal performance, create the following composite indexes:

1. In the Firestore Console, go to the "Indexes" tab
2. Click "Add index"
3. Create the following indexes:

### Index 1: Comments by Group and Passage
- Collection ID: `passageComments`
- Fields to index:
  - `groupId` (Ascending)
  - `passageRef` (Ascending)
  - `createdAt` (Ascending)
- Query scope: Collection

### Index 2: Notifications by Recipient
- Collection ID: `notifications`
- Fields to index:
  - `recipientId` (Ascending)
  - `read` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection

You can also create these indexes automatically by:
1. Running the app and triggering the queries that need indexes
2. Firebase will show error messages with links to create the required indexes
3. Click the links in the error messages to auto-create the indexes

## Step 8: Test Your Setup

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to `/auth` and create a test account

3. Create a test group at `/groups`

4. Search for a Bible verse at `/bible` and try adding a comment

5. Verify that:
   - Authentication works
   - Groups can be created
   - Comments can be added and viewed
   - Notifications appear when someone replies

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that your `REACT_APP_FIREBASE_API_KEY` is correct
- Make sure your `.env` file is in the project root
- Restart your development server after changing `.env`

### "Missing or insufficient permissions"
- Verify that your Firestore security rules are published
- Check that the user is authenticated
- Ensure the user is a member of the group

### "The query requires an index"
- Click the link in the error message to create the index
- Wait a few minutes for the index to build
- Refresh the page

### Comments/Groups not appearing
- Check the browser console for errors
- Verify your security rules are correct
- Make sure the user is authenticated and is a group member

## Data Structure Reference

### Users Collection
```javascript
{
  uid: "user_id",
  email: "user@example.com",
  displayName: "John Doe",
  createdAt: "2024-01-01T00:00:00.000Z",
  role: "member",
  isAnonymous: false
}
```

### Groups Collection
```javascript
{
  name: "Youth Bible Study",
  description: "Weekly Bible study for teens",
  createdBy: "user_id",
  createdAt: "2024-01-01T00:00:00.000Z",
  members: [
    {
      userId: "user_id",
      role: "leader",
      joinedAt: "2024-01-01T00:00:00.000Z"
    }
  ],
  memberIds: ["user_id"] // For querying
}
```

### PassageComments Collection
```javascript
{
  groupId: "group_id",
  passageRef: "John 3:16",
  userId: "user_id",
  text: "This verse reminds us of God's love...",
  parentCommentId: null, // or parent comment ID for replies
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  likes: ["user_id_1", "user_id_2"],
  edited: false
}
```

### Notifications Collection
```javascript
{
  recipientId: "user_id",
  groupId: "group_id",
  passageRef: "John 3:16",
  commentId: "comment_id",
  type: "reply", // or "new_comment"
  senderId: "user_id",
  read: false,
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## Production Deployment

Before deploying to production:

1. **Review security rules** - Ensure they match your requirements
2. **Set up Firebase quotas** - Configure appropriate usage limits
3. **Enable billing** - For production-level usage
4. **Set up monitoring** - Use Firebase Analytics and Performance Monitoring
5. **Configure backup** - Set up automated Firestore backups
6. **Use environment-specific configs** - Different Firebase projects for dev/staging/prod

## Support

For more information:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
