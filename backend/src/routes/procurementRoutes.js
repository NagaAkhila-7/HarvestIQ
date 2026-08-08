const express = require('express');
const router = express.Router();
const procurementController = require('../controllers/procurementController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);

// Purchase Requests
router.get('/requests', checkPermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getPurchaseRequests);
router.post('/requests', checkPermission(PERMISSIONS.PROCUREMENT_CREATE_REQUEST), procurementController.createPurchaseRequest);
router.put('/requests/:id/review', checkPermission(PERMISSIONS.PROCUREMENT_APPROVE_REQUEST), procurementController.reviewPurchaseRequest);

// Purchase Orders
router.get('/orders', checkPermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getPurchaseOrders);
router.post('/orders', checkPermission(PERMISSIONS.PROCUREMENT_CREATE_PO), procurementController.createPurchaseOrder);
router.put('/orders/:id/status', checkPermission(PERMISSIONS.PROCUREMENT_APPROVE_PO), procurementController.updatePOStatus);

// Receiving
router.post('/receive', checkPermission(PERMISSIONS.PROCUREMENT_RECEIVE), procurementController.receivePurchaseOrder);
router.get('/receipts', checkPermission(PERMISSIONS.PROCUREMENT_VIEW), procurementController.getReceipts);

module.exports = router;
