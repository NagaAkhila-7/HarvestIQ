const farmerService = require('../services/farmerService');
const { Field, Observation, Harvest } = require('../models/Farmer');

const getFarmers = async (req, res, next) => {
  try {
    const farmers = await farmerService.getFarmers(req.organisationId, req.query);
    res.json({ success: true, data: { farmers } });
  } catch (error) {
    next(error);
  }
};

const getFarmerById = async (req, res, next) => {
  try {
    const result = await farmerService.getFarmerById(req.organisationId, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const createFarmer = async (req, res, next) => {
  try {
    const farmer = await farmerService.createFarmer(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { farmer } });
  } catch (error) {
    next(error);
  }
};

const createFarm = async (req, res, next) => {
  try {
    const farm = await farmerService.createFarm(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { farm } });
  } catch (error) {
    next(error);
  }
};

const createField = async (req, res, next) => {
  try {
    const field = await farmerService.createField(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { field } });
  } catch (error) {
    next(error);
  }
};

const getFields = async (req, res, next) => {
  try {
    const fields = await Field.find({ organisationId: req.organisationId, isDeleted: false })
      .populate({ path: 'farmId', populate: { path: 'farmerId', select: 'name code' } });
    res.json({ success: true, data: { fields } });
  } catch (error) {
    next(error);
  }
};

const recordObservation = async (req, res, next) => {
  try {
    const obs = await farmerService.recordObservation(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { observation: obs } });
  } catch (error) {
    next(error);
  }
};

const recordHarvest = async (req, res, next) => {
  try {
    const harvest = await farmerService.recordHarvest(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { harvest } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFarmers,
  getFarmerById,
  createFarmer,
  createFarm,
  createField,
  getFields,
  recordObservation,
  recordHarvest
};
