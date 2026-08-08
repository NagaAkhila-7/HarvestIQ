const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  alertType: { 
    type: String, 
    enum: ['STOCKOUT_RISK', 'EXCESS_STOCK', 'EXPIRY_WARNING', 'LEAD_TIME_DELAY', 'SUPPLIER_RISK', 'DEMAND_SPIKE', 'QUALITY_DEVIATION'], 
    required: true 
  },
  severity: { type: String, enum: ['Normal', 'Warning', 'Critical'], default: 'Warning' },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  recommendedAction: { type: String },
  status: { type: String, enum: ['Active', 'Acknowledged', 'Resolved', 'Dismissed'], default: 'Active' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['Urgent', 'Approval', 'System', 'AI Result', 'Alert', 'Procurement'], default: 'System' },
  isUrgent: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  linkUrl: { type: String, default: '' },
  relatedEntityId: { type: String, default: '' }
}, { timestamps: true });

module.exports = {
  Alert: mongoose.model('Alert', alertSchema),
  Notification: mongoose.model('Notification', notificationSchema)
};
