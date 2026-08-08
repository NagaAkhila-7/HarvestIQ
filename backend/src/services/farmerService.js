const { Farmer, Farm, Field, Observation, Harvest } = require('../models/Farmer');
const { logAuditEvent } = require('./auditService');

const getFarmers = async (organisationId, query = {}) => {
  const filter = { organisationId, isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } }
    ];
  }

  const farmers = await Farmer.find(filter).sort({ name: 1 });
  return farmers;
};

const getFarmerById = async (organisationId, id) => {
  const farmer = await Farmer.findOne({ _id: id, organisationId, isDeleted: false });
  if (!farmer) throw new Error('Farmer not found');

  const farms = await Farm.find({ farmerId: farmer._id, organisationId, isDeleted: false });
  const farmIds = farms.map(f => f._id);

  const fields = await Field.find({ farmId: { $in: farmIds }, organisationId, isDeleted: false });
  const fieldIds = fields.map(f => f._id);

  const observations = await Observation.find({ fieldId: { $in: fieldIds }, organisationId })
    .populate('recordedBy', 'name role')
    .sort({ createdAt: -1 });

  const harvests = await Harvest.find({ farmerId: farmer._id, organisationId })
    .sort({ harvestDate: -1 });

  return { farmer, farms, fields, observations, harvests };
};

const createFarmer = async (organisationId, user, farmerData) => {
  const farmer = await Farmer.create({
    ...farmerData,
    organisationId
  });

  await logAuditEvent({
    organisationId,
    user,
    action: 'CREATE',
    entityType: 'Farmer',
    entityId: farmer._id,
    details: `Registered farmer ${farmer.name} (${farmer.code})`
  });

  return farmer;
};

const createFarm = async (organisationId, user, farmData) => {
  const farm = await Farm.create({
    ...farmData,
    organisationId
  });
  return farm;
};

const createField = async (organisationId, user, fieldData) => {
  const field = await Field.create({
    ...fieldData,
    organisationId
  });
  return field;
};

const recordObservation = async (organisationId, user, obsData) => {
  const obs = await Observation.create({
    ...obsData,
    organisationId,
    recordedBy: user._id
  });
  return obs;
};

const recordHarvest = async (organisationId, user, harvestData) => {
  const harvest = await Harvest.create({
    ...harvestData,
    organisationId
  });
  return harvest;
};

module.exports = {
  getFarmers,
  getFarmerById,
  createFarmer,
  createFarm,
  createField,
  recordObservation,
  recordHarvest
};
