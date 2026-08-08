const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);

router.get('/', checkPermission(PERMISSIONS.SUPPLIER_VIEW), supplierController.getSuppliers);
router.get('/:id', checkPermission(PERMISSIONS.SUPPLIER_VIEW), supplierController.getSupplierById);
router.post('/', checkPermission(PERMISSIONS.SUPPLIER_MANAGE), supplierController.createSupplier);
router.put('/:id', checkPermission(PERMISSIONS.SUPPLIER_MANAGE), supplierController.updateSupplier);
router.delete('/:id', checkPermission(PERMISSIONS.SUPPLIER_MANAGE), supplierController.deleteSupplier);
router.post('/:id/evaluations', checkPermission(PERMISSIONS.SUPPLIER_MANAGE), supplierController.addEvaluation);

module.exports = router;
