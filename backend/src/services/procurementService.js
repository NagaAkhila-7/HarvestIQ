const { PurchaseRequest, PurchaseOrder, Receipt } = require('../models/Procurement');
const { Item } = require('../models/Item');
const Supplier = require('../models/Supplier');
const { Lot, StockBalance, StockMovement } = require('../models/Inventory');
const { logAuditEvent } = require('./auditService');

// Purchase Requests
const getPurchaseRequests = async (organisationId, query = {}) => {
  const filter = { organisationId };
  if (query.status) filter.status = query.status;

  const requests = await PurchaseRequest.find(filter)
    .populate('requestedBy', 'name email role')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });

  return requests;
};

const createPurchaseRequest = async (organisationId, user, { items, reason }) => {
  if (!items || !items.length) throw new Error('At least one item is required');

  let totalCost = 0;
  const processedItems = [];

  for (const it of items) {
    const itemDoc = await Item.findById(it.itemId);
    if (!itemDoc) throw new Error(`Item ${it.itemId} not found`);
    const estCost = (it.estimatedUnitCost || itemDoc.unitCost) * it.quantity;
    totalCost += estCost;

    processedItems.push({
      itemId: itemDoc._id,
      itemName: itemDoc.name,
      quantity: it.quantity,
      estimatedUnitCost: it.estimatedUnitCost || itemDoc.unitCost,
      requiredByDate: it.requiredByDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
  }

  const reqCount = await PurchaseRequest.countDocuments({ organisationId });
  const requestNumber = `PR-${new Date().getFullYear()}-${String(reqCount + 1).padStart(4, '0')}`;

  const pr = await PurchaseRequest.create({
    organisationId,
    requestNumber,
    requestedBy: user._id,
    items: processedItems,
    totalEstimatedCost: totalCost,
    reason: reason || 'Replenishment for agricultural seasonal demand'
  });

  await logAuditEvent({
    organisationId,
    user,
    action: 'CREATE',
    entityType: 'PurchaseRequest',
    entityId: pr._id,
    details: `Created Purchase Request ${pr.requestNumber} for ${totalCost} KES`
  });

  return pr;
};

const reviewPurchaseRequest = async (organisationId, user, requestId, { status, reviewNotes, overrideReason }) => {
  const pr = await PurchaseRequest.findOne({ _id: requestId, organisationId });
  if (!pr) throw new Error('Purchase Request not found');

  const prevStatus = pr.status;
  pr.status = status;
  pr.reviewedBy = user._id;
  pr.reviewNotes = reviewNotes || '';
  await pr.save();

  await logAuditEvent({
    organisationId,
    user,
    action: status === 'Approved' ? 'APPROVAL' : (status === 'Rejected' ? 'REJECTION' : 'OVERRIDE'),
    entityType: 'PurchaseRequest',
    entityId: pr._id,
    previousState: { status: prevStatus },
    newState: { status: pr.status },
    details: `${status} Purchase Request ${pr.requestNumber}. Notes: ${reviewNotes || 'N/A'}. Reason: ${overrideReason || 'N/A'}`
  });

  return pr;
};

// Purchase Orders
const getPurchaseOrders = async (organisationId, query = {}) => {
  const filter = { organisationId };
  if (query.status) filter.status = query.status;
  if (query.supplierId) filter.supplierId = query.supplierId;

  const orders = await PurchaseOrder.find(filter)
    .populate('supplierId', 'name code contactPerson phone')
    .populate('destinationLocationId', 'name code')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

  return orders;
};

const createPurchaseOrder = async (organisationId, user, { purchaseRequestId, supplierId, destinationLocationId, expectedDeliveryDate, paymentTerms, items }) => {
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) throw new Error('Supplier not found');

  let totalAmount = 0;
  const processedItems = [];

  for (const it of items) {
    const itemDoc = await Item.findById(it.itemId);
    if (!itemDoc) throw new Error(`Item ${it.itemId} not found`);

    const tot = (it.unitPrice || itemDoc.unitCost) * it.orderedQuantity;
    totalAmount += tot;

    processedItems.push({
      itemId: itemDoc._id,
      itemName: itemDoc.name,
      orderedQuantity: it.orderedQuantity,
      unitPrice: it.unitPrice || itemDoc.unitCost,
      totalPrice: tot
    });
  }

  const poCount = await PurchaseOrder.countDocuments({ organisationId });
  const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;

  const po = await PurchaseOrder.create({
    organisationId,
    poNumber,
    purchaseRequestId: purchaseRequestId || null,
    supplierId,
    supplierName: supplier.name,
    destinationLocationId,
    items: processedItems,
    totalAmount,
    expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + (supplier.leadTimeDays || 10) * 24 * 60 * 60 * 1000),
    paymentTerms: paymentTerms || supplier.paymentTerms || 'Net 30',
    status: 'Submitted'
  });

  if (purchaseRequestId) {
    await PurchaseRequest.findByIdAndUpdate(purchaseRequestId, { status: 'Converted to PO' });
  }

  await logAuditEvent({
    organisationId,
    user,
    action: 'CREATE',
    entityType: 'PurchaseOrder',
    entityId: po._id,
    details: `Created Purchase Order ${po.poNumber} for ${supplier.name} (${totalAmount} KES)`
  });

  return po;
};

const updatePOStatus = async (organisationId, user, poId, { status, rejectionReason }) => {
  const po = await PurchaseOrder.findOne({ _id: poId, organisationId });
  if (!po) throw new Error('Purchase Order not found');

  const prevStatus = po.status;
  po.status = status;
  if (status === 'Approved') po.approvedBy = user._id;
  if (rejectionReason) po.rejectionReason = rejectionReason;
  await po.save();

  await logAuditEvent({
    organisationId,
    user,
    action: status === 'Approved' ? 'APPROVAL' : 'UPDATE',
    entityType: 'PurchaseOrder',
    entityId: po._id,
    previousState: { status: prevStatus },
    newState: { status: po.status },
    details: `Updated PO ${po.poNumber} status to ${status}`
  });

  return po;
};

// Receiving against PO
const receivePurchaseOrder = async (organisationId, user, { purchaseOrderId, locationId, items, notes }) => {
  const po = await PurchaseOrder.findOne({ _id: purchaseOrderId, organisationId });
  if (!po) throw new Error('Purchase Order not found');

  const recCount = await Receipt.countDocuments({ organisationId });
  const receiptNumber = `GRN-${new Date().getFullYear()}-${String(recCount + 1).padStart(4, '0')}`;

  const receiptItems = [];
  let fullyReceived = true;

  for (const recItem of items) {
    const poItem = po.items.find(i => i.itemId.toString() === recItem.itemId.toString());
    if (!poItem) continue;

    const qtyRec = Number(recItem.receivedQuantity);
    poItem.receivedQuantity = (poItem.receivedQuantity || 0) + qtyRec;

    if (poItem.receivedQuantity < poItem.orderedQuantity) {
      fullyReceived = false;
    }

    // 1. Create Lot record
    const lotNumber = recItem.lotNumber || `LOT-${Date.now().toString().slice(-6)}`;
    const expiryDate = recItem.expiryDate ? new Date(recItem.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const lot = await Lot.create({
      organisationId,
      lotNumber,
      itemId: recItem.itemId,
      expiryDate,
      supplierLotNumber: recItem.supplierLotNumber || '',
      qualityStatus: recItem.qualityGrade?.includes('Pass') ? 'Passed' : 'Quarantine',
      initialQuantity: qtyRec,
      currentQuantity: qtyRec
    });

    // 2. Update Stock Balance
    let balance = await StockBalance.findOne({ organisationId, itemId: recItem.itemId, locationId, lotId: lot._id });
    if (!balance) {
      balance = new StockBalance({
        organisationId,
        itemId: recItem.itemId,
        locationId,
        lotId: lot._id,
        onHandQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0
      });
    }
    balance.onHandQuantity += qtyRec;
    balance.availableQuantity = balance.onHandQuantity - balance.reservedQuantity;
    await balance.save();

    // 3. Create Stock Movement
    await StockMovement.create({
      organisationId,
      movementType: 'Receipt',
      itemId: recItem.itemId,
      lotId: lot._id,
      toLocationId: locationId,
      quantity: qtyRec,
      referenceType: 'PO',
      referenceId: po.poNumber,
      performedBy: user._id,
      reasonCode: 'GoodsReceipt',
      notes: `Received via ${receiptNumber}`
    });

    receiptItems.push({
      itemId: recItem.itemId,
      orderedQuantity: poItem.orderedQuantity,
      receivedQuantity: qtyRec,
      rejectedQuantity: recItem.rejectedQuantity || 0,
      lotNumber,
      expiryDate,
      qualityGrade: recItem.qualityGrade || 'Pass Grade A',
      discrepancyNote: recItem.discrepancyNote || ''
    });
  }

  po.status = fullyReceived ? 'Fully Received' : 'Partially Received';
  await po.save();

  const receipt = await Receipt.create({
    organisationId,
    receiptNumber,
    purchaseOrderId: po._id,
    poNumber: po.poNumber,
    supplierId: po.supplierId,
    receivedBy: user._id,
    locationId,
    items: receiptItems,
    notes: notes || 'Standard goods receiving'
  });

  await logAuditEvent({
    organisationId,
    user,
    action: 'CREATE',
    entityType: 'Receipt',
    entityId: receipt._id,
    details: `Processed Goods Receipt ${receiptNumber} against ${po.poNumber}`
  });

  return receipt;
};

module.exports = {
  getPurchaseRequests,
  createPurchaseRequest,
  reviewPurchaseRequest,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
  receivePurchaseOrder
};
