const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userName: { type: String },
  userEmail: { type: String },
  userRole: { type: String },
  action: { 
    type: String, 
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'DATA_ACCESS', 'CREATE', 'UPDATE', 'DELETE', 
      'EXPORT', 'AI_EXECUTION', 'APPROVAL', 'REJECTION', 'OVERRIDE', 
      'CONFIG_CHANGE', 'PERMISSION_CHANGE'
    ]
  },
  entityType: { type: String, required: true }, // e.g. 'PurchaseOrder', 'User', 'Inventory'
  entityId: { type: String },
  details: { type: String },
  previousState: { type: mongoose.Schema.Types.Mixed },
  newState: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String, default: '127.0.0.1' },
  outcome: { type: String, enum: ['Success', 'Failure', 'Denied'], default: 'Success' }
}, { timestamps: true });

// Audit logs are append-only.
module.exports = mongoose.model('AuditLog', auditLogSchema);
