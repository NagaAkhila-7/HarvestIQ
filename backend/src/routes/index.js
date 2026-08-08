const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const supplierRoutes = require('./supplierRoutes');
const procurementRoutes = require('./procurementRoutes');
const farmerRoutes = require('./farmerRoutes');
const forecastRoutes = require('./forecastRoutes');
const aiRoutes = require('./aiRoutes');
const reportRoutes = require('./reportRoutes');
const notificationRoutes = require('./notificationRoutes');
const userRoutes = require('./userRoutes');
const auditRoutes = require('./auditRoutes');
const settingsRoutes = require('./settingsRoutes');

router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/procurement', procurementRoutes);
router.use('/farmers', farmerRoutes);
router.use('/forecasts', forecastRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
