const express = require('express');
const mongoose = require('mongoose');
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
const seedRoutes = require('./seedRoutes');

// Dynamic health check handler
const getHealthStatus = (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbState = mongoose.connection.readyState;
  const dbStatus = stateMap[dbState] || 'unknown';

  res.json({
    success: dbState === 1,
    message: 'HarvestIQ API is healthy',
    database: dbStatus,
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
};

router.get('/health', getHealthStatus);
router.get('/healthz', getHealthStatus);

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
router.use('/seed', seedRoutes);

module.exports = router;
