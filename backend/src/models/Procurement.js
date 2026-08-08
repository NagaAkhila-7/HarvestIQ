const mongoose = require('mongoose');

const purchaseRequestItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  estimatedUnitCost: { type: Number, required: true },
  requiredByDate: { type: Date, required: true }
});

const purchaseRequestSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  requestNumber: { type: String, required: true, unique: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [purchaseRequestItemSchema],
  totalEstimatedCost: { type: Number, default: 0 },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Pending Review', 'Approved', 'Rejected', 'Converted to PO', 'Deferred'], default: 'Pending Review' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String }
}, { timestamps: true });

const purchaseOrderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String },
  orderedQuantity: { type: Number, required: true, min: 1 },
  receivedQuantity: { type: Number, default: 0 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const purchaseOrderSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  poNumber: { type: String, required: true, unique: true },
  purchaseRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String },
  destinationLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  items: [purchaseOrderItemSchema],
  totalAmount: { type: Number, required: true },
  expectedDeliveryDate: { type: Date, required: true },
  paymentTerms: { type: String, default: 'Net 30' },
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Issued to Supplier', 'Partially Received', 'Fully Received', 'Cancelled'], 
    default: 'Submitted' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String }
}, { timestamps: true });

const receiptItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  orderedQuantity: { type: Number, required: true },
  receivedQuantity: { type: Number, required: true },
  rejectedQuantity: { type: Number, default: 0 },
  lotNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  qualityGrade: { type: String, enum: ['Pass Grade A', 'Pass Grade B', 'Quarantine', 'Rejected'], default: 'Pass Grade A' },
  discrepancyNote: { type: String }
});

const receiptSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  receiptNumber: { type: String, required: true, unique: true },
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  poNumber: { type: String },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  receivedDate: { type: Date, default: Date.now },
  items: [receiptItemSchema],
  status: { type: String, enum: ['Completed', 'Under Quality Inspection', 'Discrepancy Reported'], default: 'Completed' },
  notes: { type: String }
}, { timestamps: true });

module.exports = {
  PurchaseRequest: mongoose.model('PurchaseRequest', purchaseRequestSchema),
  PurchaseOrder: mongoose.model('PurchaseOrder', purchaseOrderSchema),
  Receipt: mongoose.model('Receipt', receiptSchema)
};
