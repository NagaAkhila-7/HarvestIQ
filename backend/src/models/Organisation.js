const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  taxId: { type: String, default: '' },
  region: { type: String, default: 'Kenya Central Rift' },
  currency: { type: String, default: 'KES' },
  settings: {
    safetyStockFormula: { type: String, default: 'SERVICE_LEVEL_VARIANCE' },
    defaultTargetServiceLevel: { type: Number, default: 0.95 }, // 95%
    autoReorderAlerts: { type: Boolean, default: true },
    aiModel: { type: String, default: 'gemini-2.5-flash' }
  },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Organisation', organisationSchema);
