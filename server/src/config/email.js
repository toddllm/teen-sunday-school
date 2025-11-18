const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter for SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

// Verify transporter configuration
const verifyEmailService = async () => {
  try {
    await transporter.verify();
    console.log('✓ Email service is ready');
    return true;
  } catch (error) {
    console.error('✗ Email service error:', error.message);
    return false;
  }
};

module.exports = { transporter, verifyEmailService };
