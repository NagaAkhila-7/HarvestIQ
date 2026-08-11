const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const { logAuditEvent } = require('./auditService');
const emailService = require('./emailService');

const generateTokens = (user, rememberMe = false) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, organisationId: user.organisationId },
    process.env.JWT_ACCESS_SECRET || 'harvestiq_super_secret_access_key_2026_safe',
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );

  const refreshTokenExpiry = rememberMe ? '30d' : (process.env.JWT_REFRESH_EXPIRY || '7d');
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'harvestiq_super_secret_refresh_key_2026_safe',
    { expiresIn: refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
};

const register = async ({ organisationName, organisationCode = 'RVFC', name, email, password, role = 'Farmer', phone }) => {
  const allowedSelfServiceRoles = ['Farmer', 'Supplier', 'Viewer'];
  if (!allowedSelfServiceRoles.includes(role)) {
    throw new Error(`Self-registration is only allowed for roles: ${allowedSelfServiceRoles.join(', ')}. Contact System Administrator for privileged role assignments.`);
  }

  const code = (organisationCode || 'RVFC').toUpperCase();
  let org = await Organisation.findOne({ code });
  if (!org) {
    org = await Organisation.create({
      name: organisationName || 'Rift Valley Farmers Cooperative Society (FPO)',
      code
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('User with this email address already exists');
  }

  const user = await User.create({
    organisationId: org._id,
    name,
    email: email.toLowerCase(),
    password,
    role,
    phone: phone || ''
  });

  await logAuditEvent({
    organisationId: org._id,
    user,
    action: 'CREATE',
    entityType: 'User',
    entityId: user._id,
    details: `Registered new user: ${user.email} (${user.role})`
  });

  const tokens = generateTokens(user);
  
  // Save hashed refresh token
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await user.save();

  return { user, tokens, organisation: org };
};

const login = async ({ email, password, rememberMe = false, ipAddress }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).populate('organisationId');
  if (!user || user.isDeleted) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated. Please contact Administrator.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await logAuditEvent({
      organisationId: user.organisationId._id,
      user,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id,
      details: 'Failed login attempt (invalid password)',
      ipAddress,
      outcome: 'Failure'
    });
    throw new Error('Invalid email or password');
  }

  const tokens = generateTokens(user, rememberMe);
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  user.lastLoginAt = new Date();
  await user.save();

  await logAuditEvent({
    organisationId: user.organisationId._id,
    user,
    action: 'LOGIN',
    entityType: 'User',
    entityId: user._id,
    details: `User logged in successfully (${user.role})`,
    ipAddress
  });

  return { user, tokens, organisation: user.organisationId };
};

const refreshToken = async (tokenString) => {
  const decoded = jwt.verify(
    tokenString, 
    process.env.JWT_REFRESH_SECRET || 'harvestiq_super_secret_refresh_key_2026_safe'
  );

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokenHash || !user.isActive) {
    throw new Error('Invalid refresh token');
  }

  const isValid = await bcrypt.compare(tokenString, user.refreshTokenHash);
  if (!isValid) {
    user.refreshTokenHash = '';
    await user.save();
    throw new Error('Token reuse detected. Session revoked.');
  }

  const tokens = generateTokens(user);
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await user.save();

  return { tokens, user };
};

const logout = async (user, ipAddress) => {
  if (user) {
    user.refreshTokenHash = '';
    await user.save();
    await logAuditEvent({
      organisationId: user.organisationId,
      user,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: user._id,
      details: 'User logged out',
      ipAddress
    });
  }
};

const forgotPassword = async (email) => {
  const genericMessage = 'If an account exists for this email, password reset instructions have been sent.';
  
  if (!email) {
    throw new Error('Email address is required.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim(), isDeleted: false });
  console.log('[ForgotPassword] User found:', Boolean(user));
  
  if (!user || !user.isActive) {
    // Return generic success response to prevent account enumeration
    return { message: genericMessage, emailSent: false };
  }

  // Generate cryptographically secure 32-byte raw token
  const rawToken = crypto.randomBytes(32).toString('hex');
  // Store SHA-256 hash of token in database
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiration
  await user.save();

  await logAuditEvent({
    organisationId: user.organisationId,
    user,
    action: 'UPDATE',
    entityType: 'User',
    entityId: user._id,
    details: `Password reset requested for ${user.email}`
  });

  const frontendUrl = process.env.FRONTEND_URL || 'https://harvestiq-nu.vercel.app';
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

  console.log('[ForgotPassword] Attempting password reset email via Brevo API');

  if (emailService.isBrevoConfigured()) {
    try {
      const resultData = await emailService.sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        userName: user.name
      });
      return {
        message: genericMessage,
        emailSent: true,
        messageId: resultData?.messageId
      };
    } catch (err) {
      console.error('[ForgotPassword] Brevo Email Delivery Error:', err.message);
      throw new Error(`Failed to send password reset email via Brevo: ${err.message}`);
    }
  }

  console.log('[ForgotPassword] Brevo API key not configured on server.');
  const response = {
    message: genericMessage,
    emailSent: false
  };

  if (process.env.NODE_ENV !== 'production') {
    response.isDevMode = true;
    response.devResetToken = rawToken;
    response.devResetUrl = resetUrl;
  }

  return response;
};

const resetPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw new Error('Reset token and new password are required.');
  }

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  // Hash incoming raw token to find matching SHA-256 hash in database
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
    isDeleted: false
  });

  if (!user || !user.isActive) {
    throw new Error('This password reset link is invalid or has expired.');
  }

  // Set new password (pre-save hook automatically hashes with bcrypt)
  user.password = newPassword;
  // Invalidate reset token and revoke active refresh tokens
  user.resetPasswordToken = '';
  user.resetPasswordExpires = null;
  user.refreshTokenHash = '';
  await user.save();

  await logAuditEvent({
    organisationId: user.organisationId,
    user,
    action: 'UPDATE',
    entityType: 'User',
    entityId: user._id,
    details: `Password successfully reset for ${user.email}`
  });

  return { message: 'Password reset successful. You may now sign in with your new password.' };
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
};
