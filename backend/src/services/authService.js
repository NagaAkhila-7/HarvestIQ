const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const { logAuditEvent } = require('./auditService');

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
    // Possible token reuse attack - clear token hash
    user.refreshTokenHash = '';
    await user.save();
    throw new Error('Token reuse detected. Session revoked.');
  }

  // Rotate refresh token
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

const crypto = require('crypto');
const emailService = require('./emailService');

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  const genericMessage = 'If an account with that email exists, password reset instructions have been sent.';
  
  if (!user || !user.isActive) {
    return { message: genericMessage, emailSent: false };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await logAuditEvent({
    organisationId: user.organisationId,
    user,
    action: 'UPDATE',
    entityType: 'User',
    entityId: user._id,
    details: `Password reset requested for ${user.email}`
  });

  const resetUrl = `http://localhost:5173/reset-password?token=${rawToken}`;

  if (emailService.isSmtpConfigured()) {
    try {
      await emailService.sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        userName: user.name
      });
      return {
        message: `Password reset instructions have been sent to ${user.email}. Please check your inbox and spam folder.`,
        emailSent: true
      };
    } catch (err) {
      console.error('SMTP Email Delivery Error:', err.message);
      throw new Error(`Failed to send password reset email via SMTP: ${err.message}`);
    }
  }

  // Development mode fallback when SMTP is not configured
  return {
    message: 'If an account with that email exists, password reset instructions have been sent.',
    emailSent: false,
    isDevMode: true,
    devResetToken: rawToken,
    devResetUrl: resetUrl
  };
};

const resetPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw new Error('Token and new password are required');
  }

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
    isDeleted: false
  });

  if (!user || !user.isActive) {
    throw new Error('Invalid or expired password reset token');
  }

  // Pre-save hook will hash password automatically
  user.password = newPassword;
  user.resetPasswordToken = '';
  user.resetPasswordExpires = null;
  user.refreshTokenHash = ''; // Revoke previous sessions
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
