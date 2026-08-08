const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.put('/', checkPermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.updateSettings);

module.exports = router;
