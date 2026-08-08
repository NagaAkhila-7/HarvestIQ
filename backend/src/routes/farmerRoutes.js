const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);

router.get('/', checkPermission(PERMISSIONS.FARMER_VIEW), farmerController.getFarmers);
router.get('/fields', checkPermission(PERMISSIONS.FARMER_VIEW), farmerController.getFields);
router.get('/:id', checkPermission(PERMISSIONS.FARMER_VIEW), farmerController.getFarmerById);
router.post('/', checkPermission(PERMISSIONS.FARMER_MANAGE), farmerController.createFarmer);
router.post('/farms', checkPermission(PERMISSIONS.FARMER_MANAGE), farmerController.createFarm);
router.post('/fields', checkPermission(PERMISSIONS.FARMER_MANAGE), farmerController.createField);
router.post('/observations', checkPermission(PERMISSIONS.FARMER_MANAGE), farmerController.recordObservation);
router.post('/harvests', checkPermission(PERMISSIONS.FARMER_MANAGE), farmerController.recordHarvest);

module.exports = router;
