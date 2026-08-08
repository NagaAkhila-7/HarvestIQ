const forecastService = require('../services/forecastService');

const getForecasts = async (req, res, next) => {
  try {
    const forecasts = await forecastService.getForecasts(req.organisationId, req.query);
    res.json({ success: true, data: { forecasts } });
  } catch (error) {
    next(error);
  }
};

const generateForecast = async (req, res, next) => {
  try {
    const result = await forecastService.generateItemForecast(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getDemandHistory = async (req, res, next) => {
  try {
    const history = await forecastService.getDemandHistory(req.organisationId, req.params.itemId);
    res.json({ success: true, data: { history } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getForecasts,
  generateForecast,
  getDemandHistory
};
