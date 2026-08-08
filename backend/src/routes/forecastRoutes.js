const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);

router.get('/', checkPermission(PERMISSIONS.FORECAST_VIEW), forecastController.getForecasts);
router.post('/generate', checkPermission(PERMISSIONS.FORECAST_RUN), forecastController.generateForecast);
router.get('/history/:itemId', checkPermission(PERMISSIONS.FORECAST_VIEW), forecastController.getDemandHistory);

module.exports = router;
