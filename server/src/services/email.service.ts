import nodemailer from 'nodemailer';
import logger from '../config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Only initialize if SMTP credentials are configured
    if (!smtpHost || !smtpUser || !smtpPass) {
      logger.warn('SMTP credentials not configured. Email notifications will not be sent.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      logger.info('Email transporter initialized successfully');
    } catch (error: any) {
      logger.error('Error initializing email transporter:', error);
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      logger.warn('Email transporter not initialized. Skipping email send.');
      return;
    }

    try {
      const from = process.env.EMAIL_FROM || 'noreply@teen-sunday-school.com';

      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error: any) {
      logger.error(`Error sending email to ${options.to}:`, error);
      throw error;
    }
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    to: string,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<void> {
    const html = this.generateNotificationEmailHtml(title, message, actionUrl);
    const text = this.generateNotificationEmailText(title, message, actionUrl);

    await this.sendEmail({
      to,
      subject: title,
      html,
      text,
    });
  }

  /**
   * Generate HTML for notification email
   */
  private generateNotificationEmailHtml(
    title: string,
    message: string,
    actionUrl?: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4A5568;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f7fafc;
      padding: 30px;
      border-radius: 0 0 5px 5px;
    }
    .message {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
      border-left: 4px solid #4299e1;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4299e1;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #718096;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Teen Sunday School</h1>
  </div>
  <div class="content">
    <h2>${title}</h2>
    <div class="message">
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>
    ${
      actionUrl
        ? `<a href="${actionUrl}" class="button">View Details</a>`
        : ''
    }
    <div class="footer">
      <p>You're receiving this email because of your notification preferences.</p>
      <p>To manage your notification settings, visit your account settings.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text for notification email
   */
  private generateNotificationEmailText(
    title: string,
    message: string,
    actionUrl?: string
  ): string {
    let text = `Teen Sunday School\n\n${title}\n\n${message}\n`;

    if (actionUrl) {
      text += `\n\nView details: ${actionUrl}\n`;
    }

    text += '\n---\nYou\'re receiving this email because of your notification preferences.\n';
    text += 'To manage your notification settings, visit your account settings.';

    return text;
  }

  /**
   * Send digest email with multiple notifications
   */
  async sendDigestEmail(
    to: string,
    notifications: Array<{ title: string; message: string; actionUrl?: string }>,
    period: 'daily' | 'weekly'
  ): Promise<void> {
    const subject = `Your ${period} notification digest`;
    const html = this.generateDigestEmailHtml(notifications, period);
    const text = this.generateDigestEmailText(notifications, period);

    await this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Generate HTML for digest email
   */
  private generateDigestEmailHtml(
    notifications: Array<{ title: string; message: string; actionUrl?: string }>,
    period: 'daily' | 'weekly'
  ): string {
    const notificationItems = notifications
      .map(
        (n) => `
      <div class="notification-item">
        <h3>${n.title}</h3>
        <p>${n.message.replace(/\n/g, '<br>')}</p>
        ${n.actionUrl ? `<a href="${n.actionUrl}" class="link">View details →</a>` : ''}
      </div>
    `
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${period} notification digest</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4A5568;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f7fafc;
      padding: 30px;
      border-radius: 0 0 5px 5px;
    }
    .notification-item {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      margin: 15px 0;
      border-left: 4px solid #4299e1;
    }
    .notification-item h3 {
      margin-top: 0;
      color: #2d3748;
    }
    .link {
      color: #4299e1;
      text-decoration: none;
    }
    .footer {
      text-align: center;
      color: #718096;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Teen Sunday School</h1>
    <p>Your ${period} notification digest</p>
  </div>
  <div class="content">
    <p>Here are your notifications from the past ${period === 'daily' ? 'day' : 'week'}:</p>
    ${notificationItems}
    <div class="footer">
      <p>You're receiving this ${period} digest because of your notification preferences.</p>
      <p>To manage your notification settings, visit your account settings.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text for digest email
   */
  private generateDigestEmailText(
    notifications: Array<{ title: string; message: string; actionUrl?: string }>,
    period: 'daily' | 'weekly'
  ): string {
    let text = `Teen Sunday School - Your ${period} notification digest\n\n`;
    text += `Here are your notifications from the past ${period === 'daily' ? 'day' : 'week'}:\n\n`;

    notifications.forEach((n, index) => {
      text += `${index + 1}. ${n.title}\n${n.message}\n`;
      if (n.actionUrl) {
        text += `View details: ${n.actionUrl}\n`;
      }
      text += '\n';
    });

    text += '---\n';
    text += `You're receiving this ${period} digest because of your notification preferences.\n`;
    text += 'To manage your notification settings, visit your account settings.';

    return text;
  }
}
