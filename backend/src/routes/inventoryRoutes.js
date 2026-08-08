const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);

router.get('/items', checkPermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getItems);
router.get('/items/:id', checkPermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getItemById);
router.post('/items', checkPermission(PERMISSIONS.INVENTORY_MANAGE), inventoryController.createItem);
router.put('/items/:id', checkPermission(PERMISSIONS.INVENTORY_MANAGE), inventoryController.updateItem);
router.delete('/items/:id', checkPermission(PERMISSIONS.INVENTORY_MANAGE), inventoryController.deleteItem);

router.post('/movements', checkPermission(PERMISSIONS.INVENTORY_ADJUST), inventoryController.recordMovement);
router.get('/movements', checkPermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getMovements);

router.get('/categories', checkPermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getCategories);
router.get('/locations', checkPermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getLocations);
router.get('/lots', checkPermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getLots);
router.get('/expiry-alerts', checkPermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.getExpiryAlerts);

module.exports = router;
