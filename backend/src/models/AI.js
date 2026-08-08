const mongoose = require('mongoose');

const aiRunSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  runType: { type: String, enum: ['ReorderRecommendation', 'SupplierRiskCheck', 'POAnomalyDetection', 'StockoutPrediction', 'CopilotQuery'], required: true },
  model: { type: String, default: 'gemini-2.5-flash' },
  promptSnapshot: { type: String },
  inputDataSnapshot: { type: mongoose.Schema.Types.Mixed },
  rawOutput: { type: String },
  parsedRecommendation: { type: mongoose.Schema.Types.Mixed },
  tokenCount: { type: Number, default: 0 },
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  executionTimeMs: { type: Number, default: 0 }
}, { timestamps: true });

const aiRecommendationSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  aiRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIRun' },
  recommendationType: { 
    type: String, 
    required: true, 
    enum: ['REORDER_QUANTITY', 'REORDER_TIMING', 'LOCATION_TRANSFER', 'SUPPLIER_ALLOCATION', 'SAFETY_STOCK_ADJUSTMENT', 'SUBSTITUTE_ITEM', 'SUPPLIER_RISK_ALERT', 'PO_ANOMALY'] 
  },
  targetItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  targetSupplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  targetLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  title: { type: String, required: true },
  recommendedAction: { type: String, required: true }, // e.g. "Create Purchase Request for 250 bags of Hybrid Seed"
  suggestedValue: { type: mongoose.Schema.Types.Mixed }, // e.g. { quantity: 250, supplierId: '...', targetDate: '2026-08-20' }
  confidenceScore: { type: Number, default: 0.89 },
  status: { type: String, enum: ['Pending Review', 'Approved', 'Rejected', 'Overridden', 'Deferred'], default: 'Pending Review' },
  evidence: {
    currentStock: Number,
    reservedStock: Number,
    forecastDemand: Number,
    leadTimeDays: Number,
    moq: Number,
    cashFlowImpact: Number,
    riskFactors: [String]
  },
  conciseExplanation: { type: String, required: true }
}, { timestamps: true });

const approvalOverrideSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  entityType: { type: String, enum: ['AIRecommendation', 'PurchaseRequest', 'PurchaseOrder', 'InventoryAdjustment'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, enum: ['Approve', 'Reject', 'Override', 'Defer', 'Escalate'], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorName: { type: String },
  actorRole: { type: String },
  previousValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  overrideReason: { type: String, required: true }, // Mandatory override/decision reason
  outcome: { type: String, required: true }
}, { timestamps: true });

module.exports = {
  AIRun: mongoose.model('AIRun', aiRunSchema),
  AIRecommendation: mongoose.model('AIRecommendation', aiRecommendationSchema),
  ApprovalOverride: mongoose.model('ApprovalOverride', approvalOverrideSchema)
};
