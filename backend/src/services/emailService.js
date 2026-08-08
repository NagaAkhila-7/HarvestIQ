const nodemailer = require('nodemailer');

const isSmtpConfigured = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
};

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendPasswordResetEmail = async ({ to, resetUrl, userName = 'HarvestIQ User' }) => {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP credentials are not configured on the server.');
  }

  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || `"HarvestIQ Security" <${process.env.SMTP_USER}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
        .logo { font-size: 24px; font-weight: 800; color: #10b981; margin-bottom: 24px; display: inline-block; }
        .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; margin-bottom: 24px; }
        .footer { font-size: 12px; color: #64748b; margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; }
        .warning { background-color: #334155; padding: 12px; border-radius: 6px; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">HIQ | HarvestIQ</div>
        <div class="title">Password Reset Request</div>
        <p class="text">Hello ${userName},</p>
        <p class="text">We received a request to reset the password for your HarvestIQ operational account. Click the button below to choose a new password:</p>
        <div>
          <a href="${resetUrl}" class="btn" target="_blank">Reset Your Password</a>
        </div>
        <p class="text">Or copy and paste this link into your browser:<br><span style="color: #34d399; font-size: 12px;">${resetUrl}</span></p>
        <div class="warning">
          <strong>Security Notice:</strong> This password reset link is valid for 1 hour. If you did not request a password reset, please ignore this message. Your account remains secure.
        </div>
        <div class="footer">
          © 2026 HarvestIQ Platform. AI-Powered Agriculture Demand & Inventory Optimiser.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'HarvestIQ Account Password Reset Instructions',
      html: htmlContent
    });
    console.log(`Password reset email sent successfully to ${to}`);
    return info;
  } catch (err) {
    console.error(`Password reset email failed: ${err.message}`);
    throw err;
  }
};

module.exports = {
  isSmtpConfigured,
  sendPasswordResetEmail
};
