const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);
router.use(checkPermission(PERMISSIONS.AUDIT_VIEW));

router.get('/', auditController.getAuditLogs);

module.exports = router;
