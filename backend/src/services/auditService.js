const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({
  organisationId,
  user,
  action,
  entityType,
  entityId,
  details,
  previousState,
  newState,
  ipAddress,
  outcome = 'Success'
}) => {
  try {
    if (!organisationId) return;

    await AuditLog.create({
      organisationId,
      user: user ? user._id : null,
      userName: user ? user.name : 'System',
      userEmail: user ? user.email : 'system@harvestiq.org',
      userRole: user ? user.role : 'System',
      action,
      entityType,
      entityId: entityId ? entityId.toString() : '',
      details: details || '',
      previousState: previousState || null,
      newState: newState || null,
      ipAddress: ipAddress || '127.0.0.1',
      outcome
    });
  } catch (error) {
    console.error('[Audit Service Error]', error.message);
  }
};

module.exports = {
  logAuditEvent
};
