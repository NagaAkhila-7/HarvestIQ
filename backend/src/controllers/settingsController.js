const Organisation = require('../models/Organisation');
const { Configuration } = require('../models/System');
const { logAuditEvent } = require('../services/auditService');

const getSettings = async (req, res, next) => {
  try {
    const org = await Organisation.findById(req.organisationId);
    const configs = await Configuration.find({ organisationId: req.organisationId });

    res.json({
      success: true,
      data: {
        organisation: org,
        configurations: configs
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { settings, name, region, currency } = req.body;
    const org = await Organisation.findById(req.organisationId);
    if (!org) throw new Error('Organisation not found');

    const prev = org.toObject();
    if (name) org.name = name;
    if (region) org.region = region;
    if (currency) org.currency = currency;
    if (settings) {
      org.settings = { ...org.settings, ...settings };
    }

    await org.save();

    await logAuditEvent({
      organisationId: req.organisationId,
      user: req.user,
      action: 'CONFIG_CHANGE',
      entityType: 'Organisation',
      entityId: org._id,
      previousState: prev.settings,
      newState: org.settings,
      details: 'Updated organisation system settings & parameters'
    });

    res.json({
      success: true,
      data: { organisation: org }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
