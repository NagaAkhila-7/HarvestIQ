const User = require('../models/User');
const { logAuditEvent } = require('../services/auditService');

const getUsers = async (req, res, next) => {
  try {
    const filter = { organisationId: req.organisationId, isDeleted: false };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, customPermissions } = req.body;
    
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('User email already registered');

    const user = await User.create({
      organisationId: req.organisationId,
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone: phone || '',
      customPermissions: customPermissions || []
    });

    await logAuditEvent({
      organisationId: req.organisationId,
      user: req.user,
      action: 'CREATE',
      entityType: 'User',
      entityId: user._id,
      details: `Admin created user ${user.email} with role ${user.role}`
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, isActive, customPermissions } = req.body;

    const user = await User.findOne({ _id: id, organisationId: req.organisationId });
    if (!user) throw new Error('User not found');

    const prev = user.toObject();
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (customPermissions) user.customPermissions = customPermissions;

    await user.save();

    await logAuditEvent({
      organisationId: req.organisationId,
      user: req.user,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user._id,
      previousState: { role: prev.role, isActive: prev.isActive },
      newState: { role: user.role, isActive: user.isActive },
      details: `Updated user ${user.email}`
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser
};
