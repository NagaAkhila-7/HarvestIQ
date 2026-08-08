const aiService = require('../services/aiService');
const { AIRecommendation, AIRun, ApprovalOverride } = require('../models/AI');

const getRecommendations = async (req, res, next) => {
  try {
    const filter = { organisationId: req.organisationId };
    if (req.query.status) filter.status = req.query.status;

    const recommendations = await AIRecommendation.find(filter)
      .populate('targetItemId', 'name sku unit unitCost')
      .populate('targetSupplierId', 'name code')
      .populate('targetLocationId', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { recommendations } });
  } catch (error) {
    next(error);
  }
};

const triggerAnalysis = async (req, res, next) => {
  try {
    const recommendations = await aiService.generateRecommendations(req.organisationId, req.user);
    res.json({ success: true, data: { recommendations, message: 'AI Analysis complete' } });
  } catch (error) {
    next(error);
  }
};

const decideRecommendation = async (req, res, next) => {
  try {
    const rec = await aiService.decideRecommendation(req.organisationId, req.user, req.params.id, req.body);
    res.json({ success: true, data: { recommendation: rec } });
  } catch (error) {
    next(error);
  }
};

const askCopilot = async (req, res, next) => {
  try {
    const { prompt, lang } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Prompt is required' } });
    }

    const result = await aiService.askCopilot(req.organisationId, req.user, prompt, lang);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getAIRuns = async (req, res, next) => {
  try {
    const runs = await AIRun.find({ organisationId: req.organisationId })
      .populate('executedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: { runs } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  triggerAnalysis,
  decideRecommendation,
  askCopilot,
  getAIRuns
};
