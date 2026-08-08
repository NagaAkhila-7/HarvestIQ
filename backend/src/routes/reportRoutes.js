const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);

router.get('/dashboard-summary', reportController.getDashboardSummary);
router.get('/export-csv', checkPermission(PERMISSIONS.REPORTS_VIEW), reportController.exportReportCsv);

module.exports = router;
