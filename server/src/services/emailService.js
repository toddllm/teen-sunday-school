const { transporter } = require('../config/email');
require('dotenv').config();

class EmailService {
  /**
   * Send invitation email
   * @param {object} invitation - Invitation object
   * @param {object} organization - Organization object
   * @returns {Promise<object>} Send result
   */
  async sendInvitation(invitation, organization) {
    try {
      const inviteUrl = `${process.env.CLIENT_URL}/accept-invitation?token=${invitation.token}`;

      const htmlContent = this.generateInvitationHTML({
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        organizationName: organization.name,
        inviteUrl,
        expiresAt: invitation.expiresAt
      });

      const textContent = this.generateInvitationText({
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        organizationName: organization.name,
        inviteUrl,
        expiresAt: invitation.expiresAt
      });

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'Teen Sunday School',
          address: process.env.FROM_EMAIL
        },
        to: invitation.email,
        subject: `You're invited to join ${organization.name} on Teen Sunday School`,
        text: textContent,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate HTML email content for invitation
   */
  generateInvitationHTML({ firstName, lastName, organizationName, inviteUrl, expiresAt }) {
    const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4a5568; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">Teen Sunday School</h1>
  </div>

  <div style="background-color: #f7fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #2d3748; margin-top: 0;">You're Invited!</h2>

    <p>Hi ${firstName} ${lastName},</p>

    <p>You've been invited to join <strong>${organizationName}</strong> on Teen Sunday School - an interactive platform for Bible study and spiritual growth.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}"
         style="background-color: #4299e1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 14px; color: #718096;">
      This invitation will expire on <strong>${expiryDate}</strong>.
    </p>

    <p style="font-size: 14px; color: #718096;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${inviteUrl}" style="color: #4299e1; word-break: break-all;">${inviteUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

    <p style="font-size: 12px; color: #a0aec0; text-align: center;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text email content for invitation
   */
  generateInvitationText({ firstName, lastName, organizationName, inviteUrl, expiresAt }) {
    const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
Teen Sunday School - You're Invited!

Hi ${firstName} ${lastName},

You've been invited to join ${organizationName} on Teen Sunday School - an interactive platform for Bible study and spiritual growth.

To accept your invitation, visit this link:
${inviteUrl}

This invitation will expire on ${expiryDate}.

If you didn't expect this invitation, you can safely ignore this email.

---
Teen Sunday School
    `.trim();
  }

  /**
   * Send bulk invitations with rate limiting
   * @param {Array} invitations - Array of invitation objects
   * @param {object} organization - Organization object
   * @param {number} batchSize - Number of emails to send in each batch
   * @param {number} delayMs - Delay between batches in milliseconds
   * @returns {Promise<Array>} Results for each invitation
   */
  async sendBulkInvitations(invitations, organization, batchSize = 10, delayMs = 1000) {
    const results = [];

    for (let i = 0; i < invitations.length; i += batchSize) {
      const batch = invitations.slice(i, i + batchSize);

      const batchPromises = batch.map(invitation =>
        this.sendInvitation(invitation, organization)
          .then(result => ({
            invitationId: invitation.id,
            email: invitation.email,
            ...result
          }))
          .catch(error => ({
            invitationId: invitation.id,
            email: invitation.email,
            success: false,
            error: error.message
          }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches to avoid rate limiting
      if (i + batchSize < invitations.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}

module.exports = new EmailService();
