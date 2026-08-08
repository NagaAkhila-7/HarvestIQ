const inventoryService = require('../services/inventoryService');
const { Category, Unit } = require('../models/Item');
const { Location, Bin, Lot, StockBalance, StockMovement } = require('../models/Inventory');

const getItems = async (req, res, next) => {
  try {
    const result = await inventoryService.getItems(req.organisationId, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const result = await inventoryService.getItemById(req.organisationId, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const item = await inventoryService.createItem(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await inventoryService.updateItem(req.organisationId, req.user, req.params.id, req.body);
    res.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const result = await inventoryService.deleteItem(req.organisationId, req.user, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const recordMovement = async (req, res, next) => {
  try {
    const movement = await inventoryService.recordStockMovement(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { movement } });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ organisationId: req.organisationId, isDeleted: false });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find({ organisationId: req.organisationId, isDeleted: false });
    res.json({ success: true, data: { locations } });
  } catch (error) {
    next(error);
  }
};

const getLots = async (req, res, next) => {
  try {
    const lots = await Lot.find({ organisationId: req.organisationId }).populate('itemId', 'name sku').sort({ expiryDate: 1 });
    res.json({ success: true, data: { lots } });
  } catch (error) {
    next(error);
  }
};

const getMovements = async (req, res, next) => {
  try {
    const movements = await StockMovement.find({ organisationId: req.organisationId })
      .populate('itemId', 'name sku unit')
      .populate('performedBy', 'name email')
      .populate('fromLocationId', 'name')
      .populate('toLocationId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: { movements } });
  } catch (error) {
    next(error);
  }
};

const getExpiryAlerts = async (req, res, next) => {
  try {
    const daysAhead = parseInt(req.query.daysAhead) || 60;
    const lots = await inventoryService.getExpiryRiskLots(req.organisationId, daysAhead);
    res.json({ success: true, data: { lots } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  recordMovement,
  getCategories,
  getLocations,
  getLots,
  getMovements,
  getExpiryAlerts
};
