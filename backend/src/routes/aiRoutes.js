const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);

router.get('/recommendations', checkPermission(PERMISSIONS.AI_RECOMMENDATION_VIEW), aiController.getRecommendations);
router.post('/analyze', checkPermission(PERMISSIONS.AI_RECOMMENDATION_VIEW), aiController.triggerAnalysis);
router.put('/recommendations/:id/decide', checkPermission(PERMISSIONS.AI_RECOMMENDATION_DECIDE), aiController.decideRecommendation);
router.post('/copilot', aiController.askCopilot);
router.get('/runs', checkPermission(PERMISSIONS.AUDIT_VIEW), aiController.getAIRuns);

module.exports = router;
