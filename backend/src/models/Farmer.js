const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  location: { type: String, default: 'Nakuru North' },
  subCounty: { type: String, default: 'Bahati' },
  nationalId: { type: String },
  membershipDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  slaScore: { type: Number, default: 92 }, // SLA rating 0-100%
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const farmSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
  name: { type: String, required: true },
  totalAcreage: { type: Number, required: true, min: 0 },
  gpsCoordinates: { type: String, default: '' },
  soilType: { type: String, default: 'Loam' },
  irrigationAccess: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const fieldSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  fieldName: { type: String, required: true },
  acreage: { type: Number, required: true },
  currentCrop: { type: String, required: true }, // e.g. Hybrid Maize H614
  cropStage: { type: String, enum: ['Sowing', 'Vegetative', 'Flowering', 'Maturation', 'Harvesting', 'Fallow'], default: 'Vegetative' },
  plantingDate: { type: Date },
  expectedHarvestDate: { type: Date },
  expectedYieldKg: { type: Number, default: 0 },
  fieldRiskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Severe'], default: 'Low' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const observationSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true, index: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pestDiseaseRisk: { type: String, enum: ['None', 'Pest Outbreak', 'Fungal Attack', 'Drought Stress', 'Nutrient Deficiency'], default: 'None' },
  notes: { type: String },
  recommendedInput: { type: String },
  observationDate: { type: Date, default: Date.now }
}, { timestamps: true });

const harvestSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true, index: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  cropName: { type: String, required: true },
  quantityHarvestedKg: { type: Number, required: true },
  qualityGrade: { type: String, enum: ['Grade A', 'Grade B', 'Grade C', 'Rejected'], default: 'Grade A' },
  harvestDate: { type: Date, default: Date.now },
  deliveredToWarehouse: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
  Farmer: mongoose.model('Farmer', farmerSchema),
  Farm: mongoose.model('Farm', farmSchema),
  Field: mongoose.model('Field', fieldSchema),
  Observation: mongoose.model('Observation', observationSchema),
  Harvest: mongoose.model('Harvest', harvestSchema)
};
