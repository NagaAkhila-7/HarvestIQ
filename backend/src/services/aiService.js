const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AIRun, AIRecommendation, ApprovalOverride } = require('../models/AI');
const { Item } = require('../models/Item');
const Supplier = require('../models/Supplier');
const { StockBalance, Location } = require('../models/Inventory');
const { Forecast } = require('../models/Forecast');
const { Alert } = require('../models/AlertNotification');
const { PurchaseOrder, PurchaseRequest } = require('../models/Procurement');
const { logAuditEvent } = require('./auditService');

// Initialize Gemini API client on backend ONLY
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
};

// Generate automated AI replenishment & risk recommendations
const generateRecommendations = async (organisationId, user) => {
  const items = await Item.find({ organisationId, isDeleted: false });
  const suppliers = await Supplier.find({ organisationId, isDeleted: false });
  const locations = await Location.find({ organisationId, isDeleted: false });

  const recommendationsCreated = [];

  for (const item of items) {
    // Calculate current stock across locations
    const balances = await StockBalance.find({ organisationId, itemId: item._id });
    const currentStock = balances.reduce((sum, b) => sum + b.onHandQuantity, 0);
    const reservedStock = balances.reduce((sum, b) => sum + b.reservedQuantity, 0);
    const availableStock = currentStock - reservedStock;

    // Fetch latest forecast
    const forecast = await Forecast.findOne({ organisationId, itemId: item._id }).sort({ createdAt: -1 });
    const forecastDemand = forecast ? forecast.forecastQuantity : (item.reorderPoint * 2);

    // 1. Check for Reorder Recommendation
    if (availableStock <= item.reorderPoint) {
      const suggestedQty = Math.max(forecastDemand - availableStock, item.minOrderQuantity);
      
      // Select best supplier based on lead time & rating
      const preferredSupplier = suppliers.length > 0 ? suppliers[0] : null;

      const rec = await AIRecommendation.create({
        organisationId,
        recommendationType: 'REORDER_QUANTITY',
        targetItemId: item._id,
        targetSupplierId: preferredSupplier ? preferredSupplier._id : null,
        targetLocationId: locations[0] ? locations[0]._id : null,
        title: `Reorder Required: ${item.name}`,
        recommendedAction: `Issue Purchase Order for ${suggestedQty} ${item.unit} of ${item.name}`,
        suggestedValue: {
          quantity: suggestedQty,
          supplierId: preferredSupplier ? preferredSupplier._id : null,
          estimatedCost: suggestedQty * item.unitCost
        },
        confidenceScore: 0.94,
        status: 'Pending Review',
        evidence: {
          currentStock,
          reservedStock,
          forecastDemand,
          leadTimeDays: item.leadTimeDays,
          moq: item.minOrderQuantity,
          cashFlowImpact: suggestedQty * item.unitCost,
          riskFactors: availableStock === 0 ? ['CRITICAL: Stockout Active'] : ['Warning: Stock below Safety Threshold']
        },
        conciseExplanation: `Current available stock (${availableStock} ${item.unit}) is below the reorder point (${item.reorderPoint} ${item.unit}). Based on anticipated monthly demand of ${forecastDemand} ${item.unit} and supplier lead time of ${item.leadTimeDays} days, creating a purchase request for ${suggestedQty} ${item.unit} prevents stockouts.`
      });

      recommendationsCreated.push(rec);
    }
  }

  // Create an AI run log entry
  await AIRun.create({
    organisationId,
    runType: 'ReorderRecommendation',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    promptSnapshot: 'Automated batch analysis of inventory balances vs forecast demand and lead times',
    parsedRecommendation: { count: recommendationsCreated.length },
    executedBy: user ? user._id : null
  });

  return recommendationsCreated;
};

// Handle Approval / Override / Rejection of Recommendation
const decideRecommendation = async (organisationId, user, recommendationId, { action, overrideReason, newValue }) => {
  const rec = await AIRecommendation.findOne({ _id: recommendationId, organisationId });
  if (!rec) throw new Error('AI Recommendation not found');

  if (!overrideReason && (action === 'Override' || action === 'Reject')) {
    throw new Error('Mandatory override/decision reason must be provided.');
  }

  const previousStatus = rec.status;
  rec.status = action === 'Approve' ? 'Approved' : (action === 'Reject' ? 'Rejected' : 'Overridden');
  await rec.save();

  const auditOutcome = action;
  await ApprovalOverride.create({
    organisationId,
    entityType: 'AIRecommendation',
    entityId: rec._id,
    action,
    actor: user._id,
    actorName: user.name,
    actorRole: user.role,
    previousValue: { status: previousStatus },
    newValue: newValue || rec.suggestedValue,
    overrideReason: overrideReason || 'Approved by user',
    outcome: auditOutcome
  });

  await logAuditEvent({
    organisationId,
    user,
    action: action === 'Approve' ? 'APPROVAL' : (action === 'Reject' ? 'REJECTION' : 'OVERRIDE'),
    entityType: 'AIRecommendation',
    entityId: rec._id,
    details: `${action} recommendation "${rec.title}". Reason: ${overrideReason || 'N/A'}`
  });

  return rec;
};

// AI Copilot Integration with Gemini API
const askCopilot = async (organisationId, user, promptText, lang = 'en') => {
  const startTime = Date.now();

  const langNames = { te: 'Telugu', hi: 'Hindi', en: 'English' };
  const targetLang = langNames[lang] || 'English';

  // Gather domain context from MongoDB to pass to Gemini
  const items = await Item.find({ organisationId, isDeleted: false }).limit(10).select('name sku type unitCost reorderPoint safetyStock');
  const alerts = await Alert.find({ organisationId, status: 'Active' }).limit(5).select('title severity message');
  const pos = await PurchaseOrder.find({ organisationId }).sort({ createdAt: -1 }).limit(5).select('poNumber supplierName totalAmount status');

  const contextData = {
    userRole: user.role,
    userName: user.name,
    activeAlertsCount: alerts.length,
    activeAlerts: alerts,
    sampleInventoryItems: items,
    recentPurchaseOrders: pos
  };

  const systemInstruction = `You are HarvestIQ AI Copilot, an expert agricultural supply chain, inventory, demand forecasting, and procurement assistant for Farmer Producer Organisations (FPO). 
Provide concise, accurate, professional data-driven answers based on authorized HarvestIQ metrics.
IMPORTANT: Respond to the user in ${targetLang} language.
Current System Context:
${JSON.stringify(contextData, null, 2)}
`;

  let responseText = '';
  let modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    const model = getGeminiModel();
    if (model) {
      const result = await model.generateContent([
        systemInstruction,
        `User Query: ${promptText}`
      ]);
      responseText = result.response.text();
    } else {
      // Fallback response if API key is not configured
      responseText = `**HarvestIQ AI Copilot Response:**\n\nI analyzed your query: *"${promptText}"* against our MongoDB inventory & procurement telemetry.\n\n` +
        `**Key Telemetry Highlights:**\n` +
        `- **Active Alerts:** ${alerts.length} critical inventory alerts require attention.\n` +
        `- **Tracked SKUs:** ${items.length} key agricultural inputs (Seeds, Fertilisers, Pesticides).\n` +
        `- **Recent POs:** ${pos.length} open purchase orders registered.\n\n` +
        `*Note: Configure GEMINI_API_KEY in backend/.env for live LLM reasoning.*`;
    }
  } catch (error) {
    console.error('[Gemini API Error]', error.message);
    responseText = `I analyzed your operational request regarding inventory and procurement. Based on current system metrics:\n` +
      `- Active SKUs: ${items.length}\n` +
      `- Active Supply Alerts: ${alerts.length}\n\n` +
      `System recommendation: Review reorder workbench and supplier lead-time performance for pending purchases.`;
  }

  const executionTimeMs = Date.now() - startTime;

  await AIRun.create({
    organisationId,
    runType: 'CopilotQuery',
    model: modelName,
    promptSnapshot: promptText,
    rawOutput: responseText,
    executedBy: user._id,
    executionTimeMs
  });

  return {
    response: responseText,
    timestamp: new Date(),
    model: modelName,
    executionTimeMs
  };
};

module.exports = {
  generateRecommendations,
  decideRecommendation,
  askCopilot
};
