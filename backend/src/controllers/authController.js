const authService = require('../services/authService');
const User = require('../models/User');

const register = async (req, res, next) => {
  try {
    const { organisationName, organisationCode, name, email, password, role, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required' }
      });
    }

    const result = await authService.register({ organisationName, organisationCode, name, email, password, role, phone });

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          organisationId: result.user.organisationId
        },
        organisation: result.organisation,
        accessToken: result.tokens.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await authService.login({ email, password, rememberMe, ipAddress });

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          organisationId: result.user.organisationId,
          customPermissions: result.user.customPermissions
        },
        organisation: result.organisation,
        accessToken: result.tokens.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const tokenString = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!tokenString) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Refresh token missing' }
      });
    }

    const result = await authService.refreshToken(tokenString);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        accessToken: result.tokens.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await authService.logout(req.user, ipAddress);

    res.clearCookie('refreshToken');
    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('organisationId').select('-password');
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email address is required' }
      });
    }
    const result = await authService.forgotPassword(email);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Reset token and new password are required' }
      });
    }
    const result = await authService.resetPassword({ token, newPassword });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};
