const { Item, Category, Unit } = require('../models/Item');
const { Location, Bin, Lot, StockBalance, StockMovement } = require('../models/Inventory');
const { logAuditEvent } = require('./auditService');

// Items
const getItems = async (organisationId, query = {}) => {
  const filter = { organisationId, isDeleted: false };
  if (query.type) filter.type = query.type;
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { sku: { $regex: query.search, $options: 'i' } }
    ];
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;

  const items = await Item.find(filter)
    .populate('categoryId', 'name code')
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Item.countDocuments(filter);

  // Attach stock balances summary for each item
  const itemIds = items.map(i => i._id);
  const balances = await StockBalance.aggregate([
    { $match: { itemId: { $in: itemIds } } },
    { 
      $group: { 
        _id: '$itemId', 
        totalOnHand: { $sum: '$onHandQuantity' },
        totalReserved: { $sum: '$reservedQuantity' },
        totalAvailable: { $sum: '$availableQuantity' }
      } 
    }
  ]);

  const balanceMap = {};
  balances.forEach(b => {
    balanceMap[b._id.toString()] = b;
  });

  const enrichedItems = items.map(item => {
    const itemObj = item.toObject();
    const bal = balanceMap[item._id.toString()] || { totalOnHand: 0, totalReserved: 0, totalAvailable: 0 };
    itemObj.currentStock = bal.totalOnHand;
    itemObj.reservedQuantity = bal.totalReserved;
    itemObj.availableQuantity = bal.totalAvailable;
    itemObj.stockStatus = bal.totalOnHand <= 0 ? 'Out of Stock' : (bal.totalOnHand < item.reorderPoint ? 'Low Stock' : 'Normal');
    return itemObj;
  });

  return { items: enrichedItems, total, page, pages: Math.ceil(total / limit) };
};

const getItemById = async (organisationId, itemId) => {
  const item = await Item.findOne({ _id: itemId, organisationId, isDeleted: false })
    .populate('categoryId');
  if (!item) throw new Error('Item not found');

  const balances = await StockBalance.find({ itemId: item._id, organisationId })
    .populate('locationId', 'name code')
    .populate('binId', 'code zone')
    .populate('lotId');

  const movements = await StockMovement.find({ itemId: item._id, organisationId })
    .populate('performedBy', 'name email')
    .populate('fromLocationId', 'name')
    .populate('toLocationId', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

  const lots = await Lot.find({ itemId: item._id, organisationId }).sort({ expiryDate: 1 });

  const totalOnHand = balances.reduce((sum, b) => sum + b.onHandQuantity, 0);
  const totalReserved = balances.reduce((sum, b) => sum + b.reservedQuantity, 0);

  return {
    item,
    currentStock: totalOnHand,
    reservedQuantity: totalReserved,
    availableQuantity: totalOnHand - totalReserved,
    balances,
    movements,
    lots
  };
};

const createItem = async (organisationId, user, itemData) => {
  const existing = await Item.findOne({ sku: itemData.sku, organisationId });
  if (existing) throw new Error(`Item with SKU ${itemData.sku} already exists`);

  const category = await Category.findById(itemData.categoryId);
  if (!category) throw new Error('Invalid Category');

  const item = await Item.create({
    ...itemData,
    organisationId,
    categoryName: category.name
  });

  await logAuditEvent({
    organisationId,
    user,
    action: 'CREATE',
    entityType: 'Item',
    entityId: item._id,
    details: `Created item ${item.name} (${item.sku})`
  });

  return item;
};

const updateItem = async (organisationId, user, itemId, updateData) => {
  const item = await Item.findOne({ _id: itemId, organisationId });
  if (!item) throw new Error('Item not found');

  const prev = item.toObject();
  Object.assign(item, updateData);
  await item.save();

  await logAuditEvent({
    organisationId,
    user,
    action: 'UPDATE',
    entityType: 'Item',
    entityId: item._id,
    previousState: prev,
    newState: item.toObject(),
    details: `Updated item ${item.name}`
  });

  return item;
};

// Stock Adjustments / Movements
const recordStockMovement = async (organisationId, user, { movementType, itemId, lotId, fromLocationId, toLocationId, quantity, reasonCode, notes, referenceType, referenceId }) => {
  const qty = Number(quantity);
  if (!qty || qty <= 0) throw new Error('Quantity must be greater than zero');

  const item = await Item.findOne({ _id: itemId, organisationId });
  if (!item) throw new Error('Item not found');

  // Handle Stock Balance Updates
  if (movementType === 'Receipt' || movementType === 'TransferIn') {
    let balance = await StockBalance.findOne({ itemId, locationId: toLocationId, lotId });
    if (!balance) {
      balance = new StockBalance({
        organisationId,
        itemId,
        locationId: toLocationId,
        lotId,
        onHandQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0
      });
    }
    balance.onHandQuantity += qty;
    balance.availableQuantity = balance.onHandQuantity - balance.reservedQuantity;
    await balance.save();
  } else if (movementType === 'Issue' || movementType === 'TransferOut' || movementType === 'ExpiryScrap') {
    let balance = await StockBalance.findOne({ itemId, locationId: fromLocationId, lotId });
    if (!balance || balance.onHandQuantity < qty) {
      throw new Error(`Insufficient stock available at location for ${movementType}`);
    }
    balance.onHandQuantity -= qty;
    balance.availableQuantity = balance.onHandQuantity - balance.reservedQuantity;
    await balance.save();
  } else if (movementType === 'Adjustment') {
    let balance = await StockBalance.findOne({ itemId, locationId: toLocationId || fromLocationId, lotId });
    if (!balance) {
      balance = new StockBalance({
        organisationId,
        itemId,
        locationId: toLocationId || fromLocationId,
        lotId,
        onHandQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0
      });
    }
    // Net adjustment
    balance.onHandQuantity = Math.max(0, balance.onHandQuantity + qty); // positive or negative
    balance.availableQuantity = Math.max(0, balance.onHandQuantity - balance.reservedQuantity);
    await balance.save();
  }

  const movement = await StockMovement.create({
    organisationId,
    movementType,
    itemId,
    lotId,
    fromLocationId,
    toLocationId,
    quantity: qty,
    referenceType: referenceType || 'ManualAdjustment',
    referenceId: referenceId || '',
    performedBy: user._id,
    reasonCode: reasonCode || 'General',
    notes
  });

  await logAuditEvent({
    organisationId,
    user,
    action: 'CREATE',
    entityType: 'StockMovement',
    entityId: movement._id,
    details: `${movementType} of ${qty} ${item.unit} for SKU ${item.sku}`
  });

  return movement;
};

// Lot Management & Expiries
const getExpiryRiskLots = async (organisationId, daysAhead = 60) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

  const lots = await Lot.find({
    organisationId,
    currentQuantity: { $gt: 0 },
    expiryDate: { $lte: cutoffDate }
  }).populate('itemId', 'name sku unit unitCost categoryName').sort({ expiryDate: 1 });

  return lots;
};

const deleteItem = async (organisationId, user, itemId) => {
  const item = await Item.findOne({ _id: itemId, organisationId, isDeleted: false });
  if (!item) throw new Error('Item not found');

  item.isDeleted = true;
  await item.save();

  await logAuditEvent({
    organisationId,
    user,
    action: 'DELETE',
    entityType: 'Item',
    entityId: item._id,
    details: `Deleted item ${item.name} (${item.sku})`
  });

  return { message: 'Item deleted successfully' };
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  recordStockMovement,
  getExpiryRiskLots
};
