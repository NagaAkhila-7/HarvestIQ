const isBrevoConfigured = () => {
  return Boolean(
    process.env.BREVO_API_KEY && 
    process.env.BREVO_API_KEY.trim() !== '' &&
    process.env.BREVO_SENDER_EMAIL &&
    process.env.BREVO_SENDER_EMAIL.trim() !== ''
  );
};

const sendPasswordResetEmail = async ({ to, resetUrl, userName = 'HarvestIQ User' }) => {
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.trim() === '') {
    throw new Error('BREVO_API_KEY is not configured on the server.');
  }

  if (!process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL.trim() === '') {
    throw new Error('BREVO_SENDER_EMAIL is not configured.');
  }

  const apiKey = process.env.BREVO_API_KEY.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL.trim();
  const senderName = 'HarvestIQ Security';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 36px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .logo-box { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .logo-badge { background-color: #10b981; color: #ffffff; font-weight: 900; font-size: 16px; padding: 6px 12px; border-radius: 8px; }
        .brand-name { font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
        .title { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
        .btn-wrapper { margin: 28px 0; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .url-box { background-color: #0f172a; padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 12px; color: #34d399; margin-bottom: 24px; border: 1px solid #334155; }
        .warning { background-color: #334155/60; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 6px; font-size: 12px; color: #e2e8f0; line-height: 1.5; margin-bottom: 24px; }
        .footer { font-size: 11px; color: #64748b; margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-box">
          <span class="logo-badge">HIQ</span>
          <span class="brand-name">HarvestIQ</span>
        </div>
        
        <div class="title">Reset your HarvestIQ password</div>
        
        <p class="text">Hello ${userName},</p>
        <p class="text">We received a request to reset the password for your HarvestIQ operational account. Click the button below to create a new password:</p>
        
        <div class="btn-wrapper">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
        </div>
        
        <p class="text">If the button above does not work, copy and paste this URL into your browser:</p>
        <div class="url-box">${resetUrl}</div>
        
        <div class="warning">
          <strong>Expiration Notice:</strong> This password reset link is valid for 30 minutes. If you did not request a password reset, you can safely ignore this email. Your account password will remain unchanged.
        </div>
        
        <div class="footer">
          © 2026 HarvestIQ Platform. AI-Powered Agriculture Demand & Inventory Optimiser.<br>
          This is an automated system email. Please do not reply directly to this message.
        </div>
      </div>
    </body>
    </html>
  `;

  console.log('[EmailProvider] Brevo request started');
  console.log('[EmailProvider] Recipient configured: true');

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: to,
        name: userName
      }
    ],
    subject: 'Reset your HarvestIQ password',
    htmlContent
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify(payload)
  });

  const responseData = await response.json();

  if (!response.ok || !responseData.messageId) {
    const errorMsg = responseData.message || responseData.code || `HTTP ${response.status}`;
    console.error('[EmailProvider] Brevo request failed');
    console.error('[EmailProvider] Error:', errorMsg);
    throw new Error(`Brevo transactional email delivery failed: ${errorMsg}`);
  }

  console.log('[EmailProvider] Brevo request successful');
  console.log('[EmailProvider] Message ID:', responseData.messageId);

  return responseData;
};

module.exports = {
  isBrevoConfigured,
  sendPasswordResetEmail
};
