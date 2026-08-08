const Supplier = require('../models/Supplier');
const { logAuditEvent } = require('./auditService');

const getSuppliers = async (organisationId, query = {}) => {
  const filter = { organisationId, isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.riskLevel) filter.riskLevel = query.riskLevel;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { contactPerson: { $regex: query.search, $options: 'i' } }
    ];
  }

  const suppliers = await Supplier.find(filter).sort({ name: 1 });
  return suppliers;
};

const getSupplierById = async (organisationId, id) => {
  const supplier = await Supplier.findOne({ _id: id, organisationId, isDeleted: false });
  if (!supplier) throw new Error('Supplier not found');
  return supplier;
};

const createSupplier = async (organisationId, user, supplierData) => {
  const existing = await Supplier.findOne({ code: supplierData.code.toUpperCase(), organisationId });
  if (existing) throw new Error(`Supplier code ${supplierData.code} already exists`);

  const supplier = await Supplier.create({
    ...supplierData,
    code: supplierData.code.toUpperCase(),
    organisationId
  });

  await logAuditEvent({
    organisationId,
    user,
    action: 'CREATE',
    entityType: 'Supplier',
    entityId: supplier._id,
    details: `Created supplier ${supplier.name} (${supplier.code})`
  });

  return supplier;
};

const updateSupplier = async (organisationId, user, id, updateData) => {
  const supplier = await Supplier.findOne({ _id: id, organisationId });
  if (!supplier) throw new Error('Supplier not found');

  const prev = supplier.toObject();
  Object.assign(supplier, updateData);
  await supplier.save();

  await logAuditEvent({
    organisationId,
    user,
    action: 'UPDATE',
    entityType: 'Supplier',
    entityId: supplier._id,
    previousState: prev,
    newState: supplier.toObject(),
    details: `Updated supplier ${supplier.name}`
  });

  return supplier;
};

const addEvaluation = async (organisationId, user, supplierId, evalData) => {
  const supplier = await Supplier.findOne({ _id: supplierId, organisationId });
  if (!supplier) throw new Error('Supplier not found');

  supplier.evaluations.push({
    evaluatorId: user._id,
    period: evalData.period || '2026-Q3',
    onTimeDeliveryRate: evalData.onTimeDeliveryRate || 95,
    qualityPassRate: evalData.qualityPassRate || 98,
    priceCompetitivenessScore: evalData.priceCompetitivenessScore || 4.5,
    overallRating: evalData.overallRating || 4.6,
    notes: evalData.notes || ''
  });

  await supplier.save();
  return supplier;
};

const deleteSupplier = async (organisationId, user, id) => {
  const supplier = await Supplier.findOne({ _id: id, organisationId, isDeleted: false });
  if (!supplier) throw new Error('Supplier not found');

  supplier.isDeleted = true;
  await supplier.save();

  await logAuditEvent({
    organisationId,
    user,
    action: 'DELETE',
    entityType: 'Supplier',
    entityId: supplier._id,
    details: `Deleted supplier ${supplier.name} (${supplier.code})`
  });

  return { message: 'Supplier deleted successfully' };
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addEvaluation
};
