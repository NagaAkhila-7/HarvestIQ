const mongoose = require('mongoose');

const supplierLeadTimeSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  leadTimeDays: { type: Number, required: true },
  minimumOrderQty: { type: Number, default: 1 },
  contractedUnitPrice: { type: Number, required: true }
});

const supplierEvaluationSchema = new mongoose.Schema({
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  period: { type: String }, // e.g. '2026-Q1'
  onTimeDeliveryRate: { type: Number, default: 95 }, // 0-100%
  qualityPassRate: { type: Number, default: 98 }, // 0-100%
  priceCompetitivenessScore: { type: Number, default: 4.5 }, // 1-5
  overallRating: { type: Number, default: 4.6 },
  notes: { type: String }
});

const supplierSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String },
  address: { type: String },
  categoriesSupplied: [{ type: String }],
  paymentTerms: { type: String, default: 'Net 30' },
  status: { type: String, enum: ['Active', 'Under Review', 'Suspended'], default: 'Active' },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  leadTimes: [supplierLeadTimeSchema],
  evaluations: [supplierEvaluationSchema],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
