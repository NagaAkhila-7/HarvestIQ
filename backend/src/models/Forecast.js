const mongoose = require('mongoose');

const demandHistorySchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  periodDate: { type: Date, required: true }, // e.g. 1st of month or week
  periodType: { type: String, enum: ['Weekly', 'Monthly'], default: 'Monthly' },
  actualDemandQuantity: { type: Number, required: true, min: 0 },
  contributingAcreage: { type: Number, default: 0 },
  activeFarmersCount: { type: Number, default: 0 }
}, { timestamps: true });

const forecastSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  itemName: { type: String },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  forecastPeriod: { type: String, required: true }, // e.g. "2026-09" or "2026-W36"
  periodStartDate: { type: Date, required: true },
  forecastQuantity: { type: Number, required: true },
  confidenceIntervalLower: { type: Number, required: true },
  confidenceIntervalUpper: { type: Number, required: true },
  confidenceScore: { type: Number, default: 0.88 }, // 0.0 - 1.0
  modelVersion: { type: String, default: 'HarvestIQ-DemandNet-v2.5' },
  sourceDataSnapshot: {
    historicalAverage: Number,
    acreageDriver: Number,
    cropStageFactor: Number,
    weatherRiskFactor: Number
  },
  assumptions: [{ type: String }],
  explanation: { type: String },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

const replenishmentParamSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, unique: true },
  targetServiceLevel: { type: Number, default: 0.95 }, // e.g. 95%
  leadTimeDays: { type: Number, default: 14 },
  leadTimeVarianceDays: { type: Number, default: 3 },
  demandVariance: { type: Number, default: 15 }, // standard deviation
  minOrderQuantity: { type: Number, default: 100 },
  orderMultiple: { type: Number, default: 10 },
  calculatedSafetyStock: { type: Number, default: 50 },
  calculatedReorderPoint: { type: Number, default: 150 },
  calculatedMaxStock: { type: Number, default: 600 },
  lastCalculatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = {
  DemandHistory: mongoose.model('DemandHistory', demandHistorySchema),
  Forecast: mongoose.model('Forecast', forecastSchema),
  ReplenishmentParam: mongoose.model('ReplenishmentParam', replenishmentParamSchema)
};
