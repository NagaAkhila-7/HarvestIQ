const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  code: { type: String, required: true }, // e.g. WH-NAKURU
  name: { type: String, required: true }, // Central Nakuru Warehouse
  address: { type: String },
  capacityM3: { type: Number, default: 5000 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const binSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
  code: { type: String, required: true }, // e.g. BIN-A1-02
  zone: { type: String, default: 'Zone A' },
  maxWeightKg: { type: Number, default: 2000 }
}, { timestamps: true });

const lotSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  lotNumber: { type: String, required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  manufactureDate: { type: Date },
  expiryDate: { type: Date, required: true },
  supplierLotNumber: { type: String },
  qualityStatus: { type: String, enum: ['Passed', 'Quarantine', 'Rejected', 'Expired'], default: 'Passed' },
  initialQuantity: { type: Number, required: true },
  currentQuantity: { type: Number, required: true },
  notes: { type: String }
}, { timestamps: true });

const stockBalanceSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
  binId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bin' },
  lotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lot' },
  onHandQuantity: { type: Number, default: 0, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  availableQuantity: { type: Number, default: 0, min: 0 } // derived: onHand - reserved
}, { timestamps: true });

const stockMovementSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  movementType: { 
    type: String, 
    required: true, 
    enum: ['Receipt', 'Issue', 'TransferIn', 'TransferOut', 'Adjustment', 'Reservation', 'Release', 'ExpiryScrap'] 
  },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  lotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lot' },
  fromLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  toLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  quantity: { type: Number, required: true },
  referenceType: { type: String }, // e.g. 'PO', 'Transfer', 'FieldRequest', 'AuditAdjustment'
  referenceId: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reasonCode: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = {
  Location: mongoose.model('Location', locationSchema),
  Bin: mongoose.model('Bin', binSchema),
  Lot: mongoose.model('Lot', lotSchema),
  StockBalance: mongoose.model('StockBalance', stockBalanceSchema),
  StockMovement: mongoose.model('StockMovement', stockMovementSchema)
};
