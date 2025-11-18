# Bulk User Import Guide

This guide explains how to use the bulk user import feature to onboard multiple users at once.

## Overview

The bulk import feature allows organization administrators to:
- Upload a CSV file with user information
- Map CSV columns to user fields
- Validate data before import
- Send invitation emails automatically
- Monitor import progress and results

## Prerequisites

- You must be logged in as an **Organization Admin**
- You need a properly formatted CSV file
- (Optional) SendGrid configured for email invitations

## Step-by-Step Guide

### Step 1: Prepare Your CSV File

Create a CSV file with user information. Required columns:
- **Email** - User's email address
- **First Name** - User's first name
- **Last Name** - User's last name

Optional columns:
- **Group** - Class or group name (e.g., "Youth Group", "Teen Class")
- **Role** - User role (student, instructor, org_admin)

**Example CSV:**
```csv
Email,First Name,Last Name,Group,Role
john.doe@example.com,John,Doe,Youth Group,student
jane.smith@example.com,Jane,Smith,Teen Class,instructor
bob.johnson@example.com,Bob,Johnson,Youth Group,student
alice.brown@example.com,Alice,Brown,Teen Class,student
```

**Important Notes:**
- Maximum 1,000 rows per import
- Maximum file size: 5 MB
- Emails must be unique
- CSV must be saved in UTF-8 encoding

### Step 2: Upload CSV File

1. Navigate to **Admin** > **Bulk Import** (or visit `/admin/bulk-import`)
2. Click **Choose File** and select your CSV
3. Click **Upload and Continue**

The system will:
- Parse your CSV file
- Detect available columns
- Suggest column mappings
- Show a preview of the first 5 rows

### Step 3: Map Columns

1. Review the suggested column mappings
2. Adjust mappings if needed by selecting from dropdowns
3. Configure import settings:
   - **Send invitation emails** - Automatically email users with join links
   - **Skip duplicates** - Skip rows with emails that already exist
   - **Default role** - Role for users without a role specified (student/instructor)

4. Click **Validate and Continue**

### Step 4: Review Validation Results

The system validates all rows and shows:
- Total rows
- Valid rows (ready to import)
- Error rows (with specific error messages)

Common validation errors:
- Invalid email format
- Duplicate email in file or database
- Missing required fields
- Name too long (max 100 characters)

**If there are errors:**
- Review the error list
- Fix issues in your CSV
- Start over from Step 1

**If validation passes:**
- Review the import summary
- Click **Import X Users** to proceed

### Step 5: Monitor Import Progress

After clicking Import:
- You'll be redirected to the Import Monitor page
- The import runs in the background
- Status updates automatically (auto-refresh enabled)

**Import Statuses:**
- **Pending** - Waiting to start
- **Validating** - Checking data
- **Processing** - Creating users and sending emails
- **Completed** - Successfully finished
- **Failed** - Encountered an error

### Step 6: Review Results

On the Import Monitor page, you can see:
- Overall progress (successful/failed counts)
- Individual row statuses
- Invitation email statuses (sent/bounced/accepted)
- Detailed error messages for failed rows

**Row Statuses:**
- **Success** - User created successfully
- **Failed** - Error creating user (see error message)
- **Skipped** - Duplicate email, skipped per settings

**Invitation Statuses:**
- **Sent** - Email successfully sent
- **Pending** - Waiting to send
- **Bounced** - Email delivery failed
- **Accepted** - User registered with the invitation

## Import Settings Explained

### Send Invitation Emails

**Enabled (default):** Users receive an email with:
- Welcome message
- Organization name
- Link to accept invitation and create account
- Expiration date (7 days)

**Disabled:** Users are created but no emails are sent. You'll need to manually share invitation links or credentials.

### Skip Duplicates

**Enabled (default):** If an email already exists in your organization:
- That row is skipped
- Other valid rows are still imported
- Import completes successfully

**Disabled:** If any email is duplicate:
- That row fails validation
- You must remove duplicates before importing

### Default Role

Choose the role assigned to users when:
- CSV doesn't include a Role column, OR
- Role column is empty for a user

Options:
- **Student** (default) - Regular user access
- **Instructor** - Can manage lessons and content

Note: Only Super Admins can create Org Admins (not via CSV import).

## Tips for Successful Imports

1. **Test with a small file first** - Import 5-10 users to verify the process
2. **Clean your data** - Remove duplicates and invalid emails before uploading
3. **Use consistent formatting** - Keep names and groups consistent
4. **Check spam folders** - Invitation emails may be filtered
5. **Monitor progress** - Use auto-refresh to track large imports
6. **Export before importing** - Keep a backup of your CSV file

## Troubleshooting

### Upload fails immediately

- Check file is .csv format
- Verify file size under 5 MB
- Ensure file isn't corrupted

### Many validation errors

- Check CSV format matches requirements
- Verify email addresses are valid
- Remove duplicate entries
- Ensure all required fields present

### Emails not sending

- Check SendGrid configuration (server-side)
- Verify FROM_EMAIL is configured
- Check user's spam/junk folders
- Review bounced email list in import details

### Import stuck in "Processing"

- Refresh the page
- Check server logs for errors
- Large imports may take several minutes
- Contact system administrator if stuck for >30 minutes

## Import Limits

- **Maximum rows:** 1,000 per import
- **Maximum file size:** 5 MB
- **Rate limit:** 10 imports per hour per organization
- **Invitation expiry:** 7 days

For larger imports, split your CSV into multiple files.

## API Integration

Developers can use the import API programmatically:

```javascript
// 1. Upload CSV
const formData = new FormData();
formData.append('file', csvFile);
const uploadResponse = await fetch('/api/admin/orgs/{orgId}/user-imports', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const { jobId } = uploadResponse.data;

// 2. Set column mapping
await fetch(`/api/admin/orgs/{orgId}/user-imports/${jobId}/mapping`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    columnMapping: {
      email: 'Email',
      firstName: 'First Name',
      lastName: 'Last Name'
    },
    settings: {
      sendInvitations: true,
      skipDuplicates: true
    }
  })
});

// 3. Start processing
await fetch(`/api/admin/orgs/{orgId}/user-imports/${jobId}/process`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// 4. Check status
const statusResponse = await fetch(`/api/admin/orgs/{orgId}/user-imports/${jobId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Security & Privacy

- Only Organization Admins can perform imports
- All data encrypted in transit (HTTPS)
- Passwords never stored in CSV
- Users create their own passwords via invitation link
- Invitation tokens expire after 7 days
- Rate limiting prevents abuse

## Support

If you encounter issues:
1. Check this guide for troubleshooting steps
2. Review validation error messages
3. Contact your system administrator
4. Submit a bug report with import job ID

## Changelog

**Version 1.0.0** (Initial Release)
- CSV upload and parsing
- Column mapping with suggestions
- Validation with error reporting
- Async import processing
- Email invitation system
- Real-time progress monitoring
- Import history and analytics
