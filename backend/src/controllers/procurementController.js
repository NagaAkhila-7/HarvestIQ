const procurementService = require('../services/procurementService');
const { Receipt } = require('../models/Procurement');

const getPurchaseRequests = async (req, res, next) => {
  try {
    const requests = await procurementService.getPurchaseRequests(req.organisationId, req.query);
    res.json({ success: true, data: { requests } });
  } catch (error) {
    next(error);
  }
};

const createPurchaseRequest = async (req, res, next) => {
  try {
    const request = await procurementService.createPurchaseRequest(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { request } });
  } catch (error) {
    next(error);
  }
};

const reviewPurchaseRequest = async (req, res, next) => {
  try {
    const request = await procurementService.reviewPurchaseRequest(req.organisationId, req.user, req.params.id, req.body);
    res.json({ success: true, data: { request } });
  } catch (error) {
    next(error);
  }
};

const getPurchaseOrders = async (req, res, next) => {
  try {
    const orders = await procurementService.getPurchaseOrders(req.organisationId, req.query);
    res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
};

const createPurchaseOrder = async (req, res, next) => {
  try {
    const order = await procurementService.createPurchaseOrder(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

const updatePOStatus = async (req, res, next) => {
  try {
    const order = await procurementService.updatePOStatus(req.organisationId, req.user, req.params.id, req.body);
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

const receivePurchaseOrder = async (req, res, next) => {
  try {
    const receipt = await procurementService.receivePurchaseOrder(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { receipt } });
  } catch (error) {
    next(error);
  }
};

const getReceipts = async (req, res, next) => {
  try {
    const receipts = await Receipt.find({ organisationId: req.organisationId })
      .populate('supplierId', 'name code')
      .populate('receivedBy', 'name email')
      .populate('locationId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { receipts } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPurchaseRequests,
  createPurchaseRequest,
  reviewPurchaseRequest,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
  receivePurchaseOrder,
  getReceipts
};
