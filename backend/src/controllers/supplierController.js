const supplierService = require('../services/supplierService');

const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await supplierService.getSuppliers(req.organisationId, req.query);
    res.json({ success: true, data: { suppliers } });
  } catch (error) {
    next(error);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await supplierService.getSupplierById(req.organisationId, req.params.id);
    res.json({ success: true, data: { supplier } });
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.createSupplier(req.organisationId, req.user, req.body);
    res.status(201).json({ success: true, data: { supplier } });
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.updateSupplier(req.organisationId, req.user, req.params.id, req.body);
    res.json({ success: true, data: { supplier } });
  } catch (error) {
    next(error);
  }
};

const addEvaluation = async (req, res, next) => {
  try {
    const supplier = await supplierService.addEvaluation(req.organisationId, req.user, req.params.id, req.body);
    res.json({ success: true, data: { supplier } });
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const result = await supplierService.deleteSupplier(req.organisationId, req.user, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addEvaluation
};
