const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markRead);
router.put('/read-all', notificationController.markAllRead);
router.get('/alerts', notificationController.getAlerts);
router.put('/alerts/:id/status', notificationController.updateAlertStatus);

module.exports = router;
